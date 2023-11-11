require('dotenv').config()
const fetch = require('node-fetch');
const checkSubscriptions = require('../subs/checkSubs.js')

// Проверка изменений в устройствах
async function checkInfoFromAgent(deviceChanges) {
	let changes = {}
	changes["_id"] = deviceChanges.id
	for (let change of deviceChanges.attributes) {
		changes[change] = await fetch(`http://${process.env.LOCALHOST}:${process.env.PORT}/iot/entities/${deviceChanges.id}/attrs/${change}`).then(response => {
			return response.json()
		})
	}
	checkSubscriptions(changes)
}

module.exports = checkInfoFromAgent
