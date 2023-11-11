const checkInfoFromAgent = require('../subs/checkInfoFromAgent')

class AgentController {
	//POST /iot/agent
	//получение от iot агента изменений в атрибутах устройств
	async GetChangesFromAgent(req, res) {
		try {
			checkInfoFromAgent(req.body)
			res.send(req.body)
		}
		catch (e) {
			res.send(`agent ${req.method} error`);
		}
	}
}

module.exports = new AgentController
