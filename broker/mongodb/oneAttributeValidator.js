const { body } = require('express-validator/check');

// Проверка входных данных при создании атрибутa
exports.validate = [
	body('value')
		.not().isEmpty().withMessage('attribute value is required'),
	body('type')
		.not().isEmpty().withMessage('attribute type is required')
		.isIn(['number', 'text', 'boolean', 'array', 'relationship']).withMessage('type is unknown'),
]
