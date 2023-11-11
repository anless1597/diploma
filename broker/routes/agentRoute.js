const Router = require('express')
const router = new Router()
const agentController = require('../controllers/agentController')

//Маршрут агента
router.post('/', agentController.GetChangesFromAgent)

module.exports = router
