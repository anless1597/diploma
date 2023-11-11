require('dotenv').config()
const CronJob = require('cron').CronJob;
const fetch = require('node-fetch');
const checkCondition = require('./checkCondition')

// Создание подписки по времени
function CreateTimeSub(time_sub) {
	for (let time of time_sub.time) {
		const job = new CronJob(`0 ${time["minute"]} ${time["hour"]} * * ${time["days"]}`, () => CheckTimeSub(time_sub), 'Asia/Yekaterinburg');
		job.start();
	}
}

// Проверка подписки по времени
async function CheckTimeSub(time_sub) {
	let true_condition = true
	// Проверка состояния объектов
	if (time_sub.hasOwnProperty('subject')) {
		if (Object.keys(time_sub["subject"]).length!=0) {
			let bools_subs = new Array()
			const logical = /(&&|\|\||\(|\))/
			const symbols = /(<=|>=|!=|>|<|=)/
			for (let subject of time_sub.subject) {
				const typePattern = new RegExp(subject.typePattern)
				const idPattern = new RegExp(subject.idPattern)
				let check_subject = true
				let existing_types = await fetch(`http://${process.env.LOCALHOST}:${process.env.PORT}/iot/types`).then(response => {
					return response.json()
				})
				for (let type of existing_types) {
					let changed_type_name = type[0].toUpperCase() + type.slice(1, -1)
					if (typePattern.test(changed_type_name)) {
						let entities = await fetch(`http://${process.env.LOCALHOST}:${process.env.PORT}/iot/entities?type=${type}`).then(response => {
							return response.json()
						})
						for (let entity of entities) {
							if (idPattern.test(entity._id)) {
								if (subject.hasOwnProperty("condition")) {
									const condition = subject["condition"].split(symbols)
									const attribute = entity[condition[0]]
									let checked_object = {}
									checked_object["_id"] = entity._id
									checked_object[condition[0]] = attribute
									check_subject = check_subject && await checkCondition(condition, checked_object).then(b => { return b })
								}
							}
						}
					}
				}
				bools_subs.push(check_subject)
			}
			const fullCondition = time_sub.fullCondition.split(logical)
			for (let part of fullCondition) {
				if (!logical.test(part)) {
					fullCondition[fullCondition.indexOf(part)] = bools_subs[part]
				}
			}
			true_condition = eval(fullCondition.join(''))
		}
	}
	// Отправка команд
	if (time_sub.hasOwnProperty('handler') && true_condition) {
		for (let handler of time_sub.handler) {
			const idPattern = new RegExp(handler.id)
			let probably_handlers = await fetch(`http://${process.env.LOCALHOST}:${process.env.PORT}/iot/entities?type=${handler["id"].split(":")[1]}`).then(response => {
				return response.json()
			})
			for (let hand of probably_handlers) {
				if (idPattern.test(hand._id)) {
						handler_sended = true
						let data = {}
						data["id"] = hand._id
						data["command"] = handler.command
						const handler_response = await fetch(`http://${process.env.LOCALHOST}:${process.env.COMMAND_PORT}/update`, {
							method: "POST",
							headers: {
								'Content-Type': 'application/json;charset=utf-8'
							},
							body: JSON.stringify(data)
						}).then(response => {
							return response.json()
						})
				}
			}
		}
	}
	// Отправка уведомлений
	if (time_sub.hasOwnProperty('notification') && true_condition) {
		let data = {}
		data["idSub"] = time_sub._id
		if (time_sub.hasOwnProperty("description")) data["nameSub"] = time_sub.description
		const notification_response = await fetch(time_sub.notification.url, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify(data)
		}).then(response => {
			return response.json()
		})
	}
}

module.exports = CreateTimeSub
