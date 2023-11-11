const { body } = require('express-validator/check');

// Проверка входных данных при создании атрибутов
exports.validate = [
	body('*.value')
		.not().isEmpty().withMessage('attribute value is required'),
	body('*.type')
		.not().isEmpty().withMessage('attribute type is required')
		.isIn(['number', 'text', 'boolean', 'array', 'relationship']).withMessage('type is unknown'),
	body('*')
		.custom((attribute, { req }) => {
			const type = attribute.type;
			const value = attribute.value;
			if (type === 'number') {
				return typeof value === 'number';
			}
			if (type === 'text') {
				return typeof value === 'string';
			}
			if (type === 'array') {
				return Array.isArray(value);
			}
			if (type === 'boolean') {
				return (typeof value === "boolean");
			}
			if (type === 'relationship') {
				const regularExp = /broker:.+?:\d{3}/;
				return regularExp.test(value);
			}
		}).withMessage("invalid attribute value")
]
