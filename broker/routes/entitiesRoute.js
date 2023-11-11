const Router = require('express')
const router = new Router()
const entitiesController = require('../controllers/entitiesController')
const atributesController = require('../controllers/attributesController')
const attributeValueController = require('../controllers/attributesValueController')
const entityValidator = require('../mongodb/entityValidator')
const attributeValidator = require('../mongodb/attributeValidator')
const oneAttributeValidator = require('../mongodb/oneAttributeValidator')

// Маршруты объектов
router.get('/', entitiesController.getAllEntities);
router.post('/',
	entityValidator.validate,
	entitiesController.createEntity
);

router.get('/:id', entitiesController.getEntity);
router.delete('/:id', entitiesController.deleteEntity);

router.get('/:id/attrs', entitiesController.getEntityAttributes);
router.put('/:id/attrs',
	attributeValidator.validate,
	entitiesController.replaceAllEntityAttributes);
router.post('/:id/attrs', attributeValidator.validate,
	entitiesController.updateOrAppendEntityAttributes);
router.patch('/:id/attrs', attributeValidator.validate,
	entitiesController.updateExistingEntityAttributes);

router.get('/:id/relationships', entitiesController.getRelationships);

router.get('/:id/attrs/:name', atributesController.getAttributeData);
router.post('/:id/attrs/:name',
	oneAttributeValidator.validate,
	atributesController.updateAttributeData);
router.delete('/:id/attrs/:name', atributesController.deleteAttribute);

router.get('/:id/attrs/:name/value', attributeValueController.getAttributeValue);
router.put('/:id/attrs/:name/value', attributeValueController.updateAttributeValue);

module.exports = router
