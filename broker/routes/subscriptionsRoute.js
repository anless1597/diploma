const Router = require('express')
const router = new Router()
const subscriptionsController = require('../controllers/subscriptionsController')
const subscriptionsValidator = require('../mongodb/subsValidator')

// Маршруты подписок
router.get('/', subscriptionsController.getAllSubscriptions);
router.post('/',
	subscriptionsValidator.validate,
	subscriptionsController.createSubscription);

router.get('/:id', subscriptionsController.getSubscription);
router.delete('/:id', subscriptionsController.deleteSubscription);
router.patch('/:id',
	subscriptionsValidator.validate,
	subscriptionsController.updateSubscription);

module.exports = router
