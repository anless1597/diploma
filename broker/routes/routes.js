const Router = require('express');
const router = new Router();
const entitiesRouter = require('./entitiesRoute')
const typesRouter = require('./typesRoute')
const subscriptionsRouter = require('./subscriptionsRoute')
const agentRouter = require('./agentRoute')

// Маршруты
router.use("/entities", entitiesRouter);
router.use("/types", typesRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/agent", agentRouter)

module.exports = router;
