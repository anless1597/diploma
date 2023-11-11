require('dotenv').config()
const SubscriptionSchema = require("../mongodb/subsSchema")
const mongoose = require('mongoose')
const { validationResult } = require('express-validator/check');
const sendResponseWithErrors = (response, errors) => response.status(400).json({ errors: errors.array() });
const CreateTimeSub = require('../subs/timeSubs');
const fetch = require('node-fetch');

class SubscriptionsController {
	// GET /iot/subscriptions
	// Получение всех подписок
	async getAllSubscriptions(req, res) {
		let subs = await fetch(`http://${process.env.LOCALHOST}:${process.env.PORT}/iot/entities?type=time_subs,sub`).then(response => {
			return response.json()
		})
		res.send(subs)
	} catch(e) {
		res.send(`subscriptions ${req.method} error`);
	}

	// POST /iot/subscriptions
	// Создание подписки
	async createSubscription(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			sendResponseWithErrors(res, errors);
			return;
		}
		else {
			let type = "";
			if (req.body.hasOwnProperty("time")) type = "time_subs"
			else type = "subs"
			var SubscriptionModel = {}
			if (mongoose.models.hasOwnProperty(`${type}`))
				SubscriptionModel = mongoose.models[`${type}`]
			else
				SubscriptionModel = mongoose.model(type, SubscriptionSchema)
			const last_sub = await SubscriptionModel.find().sort({ _id: -1 }).limit(1).lean();
			let empty_object = true;
			for (let key in last_sub) {
				empty_object = false;
				break;
			}
			let _id = ""
			if (empty_object) _id = "broker:" + type + ":001"
			else {
				const id_num = Number(last_sub[0]._id.split(':')[2]) + 1
				if (id_num < 10) {
					_id = "broker:" + type + ":00" + id_num
				}
				else if (id_num < 100) {
					_id = "broker:" + type + ":0" + id_num
				}
				else _id = "broker:" + type + ":" + id_num
			}
			SubscriptionModel.findById(_id).exec(function (err, found) {
				if (err) { return next(err); }
				if (found) {
					res.send("subscription already exist");
				}
				else {
					let sub = {
						"_id": _id
					}
					sub = Object.assign(sub, req.body)
					SubscriptionModel.create(sub);
					res.send(sub)
					if (type == "time_subs") CreateTimeSub(sub)
				}
			});
		}
	}

	// GET /iot/subscriptions/:id
	// Получение информации о подписке
	async getSubscription(req, res) {
		try {
			const type = req.params.id.split(':')[1];
			var SubscriptionModel = {}
			if (mongoose.models.hasOwnProperty(`${type}`))
				SubscriptionModel = mongoose.models[`${type}`]
			else
				SubscriptionModel = mongoose.model(type, SubscriptionSchema)
			const sub = await SubscriptionModel.findById(req.params.id, '-__v')
			return res.json(sub)
		} catch (e) {
			res.send(`subscriptions id=${req.params.id} ${req.method} error`);
		}
	}

	// DELETE /iot/subscriptions/:id
	// Удаление подписки
	async deleteSubscription(req, res) {
		try {
			const type = req.params.id.split(':')[1];
			var SubscriptionModel = {}
			if (mongoose.models.hasOwnProperty(`${type}`))
				SubscriptionModel = mongoose.models[`${type}`]
			else
				SubscriptionModel = mongoose.model(type, SubscriptionSchema)
			const sub = await SubscriptionModel.findByIdAndDelete(req.params.id)
			return res.json(sub)
		} catch (e) {
			res.send(`subscription id=${req.params.id} ${req.method} error`);
		}
	}

	// PATCH /iot/subscriptions/:id
	// Обновление подписки
	async updateSubscription(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			sendResponseWithErrors(res, errors);
			return;
		}
		else {
			const type = req.params.id.split(':')[1];
			var SubscriptionModel = {}
			if (mongoose.models.hasOwnProperty(`${type}`))
				SubscriptionModel = mongoose.models[`${type}`]
			else
				SubscriptionModel = mongoose.model(type, SubscriptionSchema)
			let new_sub = {
				"_id": req.params.id
			}
			new_sub = Object.assign(new_sub, req.body)
			await SubscriptionModel.replaceOne({ _id: req.params.id }, new_sub)
			res.send(new_sub)
		}
	}
}

module.exports = new SubscriptionsController
