require('dotenv').config()
const fetch = require('node-fetch');
const CreateTimeSub = require('./timeSubs')

// Запуск существующих подписок по времени
async function StartTimeSubs() {
	let entities = await fetch(`http://${process.env.LOCALHOST}:${process.env.PORT}/iot/entities?type=time_subs`).then(response => {
		return response.json()
	})
	for (let time_sub of entities) {
		CreateTimeSub(time_sub)
	}
	return null
}

module.exports = StartTimeSubs
