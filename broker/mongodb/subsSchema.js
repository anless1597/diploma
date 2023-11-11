const mongoose = require("mongoose");

// Схема подписки
const SubscriptionSchema = new mongoose.Schema({
	_id: { type: String },
}, { strict: false })

module.exports = SubscriptionSchema
