const mongoose = require("mongoose");

// Схема объекта
const EntitySchema = new mongoose.Schema({
	_id: { type: String, required: true },
}, { strict: false })

module.exports = EntitySchema
