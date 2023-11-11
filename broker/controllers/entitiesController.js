require('dotenv').config()
const EntitySchema = require("../mongodb/entitySchema.js")
const mongoose = require('mongoose')
const { validationResult } = require('express-validator/check');
const sendResponseWithErrors = (response, errors) => response.status(400).json({ errors: errors.array() });
const checkSubscriptions = require('../subs/checkSubs.js')
const fetch = require('node-fetch');

class EntitiesController {
	// GET /iot/entities
	// Получение всех объектов
	async getAllEntities(req, res) {
		try {
			let collection_names = new Array()
			if (req.query.hasOwnProperty("type")) {
				collection_names = req.query.type.split(",")
			}
			else {
				collection_names = await fetch(`http://${process.env.LOCALHOST}:${process.env.PORT}/iot/types`).then(response => {
					return response.json()
				})
				if (collection_names.indexOf("subs") != -1)
					collection_names.splice(collection_names.indexOf("subs"), 1)
				if (collection_names.indexOf("time_subs") != -1)
					collection_names.splice(collection_names.indexOf("time_subs"), 1)
			}
			let entities = new Array()
			for (let collection of collection_names) {
				var EntityModel = mongoose.model(collection, EntitySchema)
				const entitiesOfType = await EntityModel.find().lean()
				entities = entities.concat(entitiesOfType)
			}
			if (req.query.hasOwnProperty("ref")) {
				entities = entities.filter(entity => {
					for (let attr in entity) {
						if (attr != "_id" && entity[attr].type == "relationship" && entity[attr].value == req.query.ref) {
							return entity
						}
					}
				})
			}
			res.send(entities)
		} catch (e) {
			res.send(`entities ${req.method} error`);
		}
	}

	// POST /iot/entities
	// Создание объекта
	async createEntity(req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			sendResponseWithErrors(res, errors);
			return;
		}
		else {
			const { type, attributes } = req.body;
			var EntityModel = mongoose.model(type, EntitySchema)
			const last_entity = await EntityModel.find().sort({ _id: -1 }).limit(1).lean();
			let empty_object = true;
			for (let key in last_entity) {
				empty_object = false;
				break;
			}
			let _id = ""
			if (empty_object) _id = "broker:" + type + ":001"
			else {
				const id_num = Number(last_entity[0]._id.split(':')[2]) + 1
				if (id_num < 10) {
					_id = "broker:" + type + ":00" + id_num
				}
				else if (id_num < 100) {
					_id = "broker:" + type + ":0" + id_num
				}
				else _id = "broker:" + type + ":" + id_num
			}
			EntityModel.findById(_id).exec(function (err, found_entity) {
				if (err) { return next(err); }
				if (found_entity) {
					res.send("entity already exist");
				}
				else {
					let entity = {
						"_id": _id
					}
					for (let attr of attributes) {
						entity = Object.assign(entity, attr)
					}
					EntityModel.create(entity);
					res.send(entity)
				}
			});
		}
	}

	// GET /iot/entities/:id
	// Получение информации об объекте
	async getEntity(req, res) {
		try {
			const type = req.params.id.split(':')[1];
			var EntityModel = {}
			if (mongoose.models.hasOwnProperty(`${type}`))
				EntityModel = mongoose.models[`${type}`]
			else
				EntityModel = mongoose.model(type, EntitySchema)
			const entity = await EntityModel.findById(req.params.id, '-__v')
			return res.json(entity)
		} catch (e) {
			res.send(`entities id=${req.params.id} ${req.method} error`);
		}
	}

	// DELETE /iot/entities/:id
	// Удаление объекта
	async deleteEntity(req, res) {
		try {
			const type = req.params.id.split(':')[1];
			var EntityModel = mongoose.model(type, EntitySchema)
			const entity = await EntityModel.findByIdAndDelete(req.params.id)
			return res.json(entity)
		} catch (e) {
			res.send(`entities id=${req.params.id} ${req.method} error`);
		}
	}

	// GET /iot/entities/:id/attrs
	// Получение всех атрибутов объекта
	async getEntityAttributes(req, res) {
		try {
			const type = req.params.id.split(':')[1];
			var EntityModel = mongoose.model(type, EntitySchema)
			const attributes = await EntityModel.findById(req.params.id, '-_id -__v')
			return res.json(attributes)
		} catch (e) {
			res.send(`entities id=${req.params.id} attrs ${req.method} error`);
		}
	}

	// PUT /iot/entities/:id/attrs
	// Замена всех атрибутов объекта
	async replaceAllEntityAttributes(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			sendResponseWithErrors(res, errors);
			return;
		}
		else {
			const type = req.params.id.split(':')[1];
			var EntityModel = mongoose.model(type, EntitySchema)
			let new_entity = {
				"_id": req.params.id
			}
			new_entity = Object.assign(new_entity, req.body)
			await EntityModel.replaceOne({ _id: req.params.id }, new_entity)
			let changes = new_entity
			checkSubscriptions(changes)
			res.send(new_entity)
		}
	}

	// POST /iot/entities/:id/attrs
	// Обновление или добавление атрибутов
	async updateOrAppendEntityAttributes(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			sendResponseWithErrors(res, errors);
			return;
		}
		else {
			const type = req.params.id.split(':')[1];
			var EntityModel = mongoose.model(type, EntitySchema)
			const entity = await EntityModel.findById({ _id: req.params.id }).lean()
			let changes = { _id: req.params.id }
			for (let attr in req.body) {
				entity[attr] = req.body[attr]
				changes[attr] = req.body[attr]
			}
			await EntityModel.replaceOne({ _id: req.params.id }, entity)
			checkSubscriptions(changes)
			res.send(entity)
		}
	}

	// PATCH /iot/entities/:id/attrs
	// Обновление существующих атрибутов
	async updateExistingEntityAttributes(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			sendResponseWithErrors(res, errors);
			return;
		}
		else {
			const type = req.params.id.split(':')[1];
			var EntityModel = mongoose.model(type, EntitySchema)
			const entity = await EntityModel.findById({ _id: req.params.id }).lean()
			let changes = { _id: req.params.id }
			for (let attr in req.body) {
				if (attr in entity) {
					entity[attr] = req.body[attr]
					changes[attr] = req.body[attr]
				}
			}
			await EntityModel.replaceOne({ _id: req.params.id }, entity)
			checkSubscriptions(changes)
			res.send(entity)
		}
	}

	// GET /iot/entities/:id/relationships
	// Получение связанных объектов
	async getRelationships(req, res) {
		let attributes = await fetch(`http://${process.env.LOCALHOST}:${process.env.PORT}/iot/entities/${req.params.id}/attrs`).then(response => {
			return response.json()
		})
		let relations = []
		for (let attr in attributes) {
			if (attributes[attr].type == "relationship") {
				const entity = await fetch(`http://${process.env.LOCALHOST}:${process.env.PORT}/iot/entities/${attributes[attr].value}`).then(response => {
					return response.json()
				})
				relations.push(entity)
			}
		}
		res.send(relations)
	}
}

module.exports = new EntitiesController
