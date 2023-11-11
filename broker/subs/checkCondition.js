// Проверка условий в подписках
async function checkCondition(condition, changes) {
	let checked_attr = {}
	if (!Object.keys(changes).includes(condition[0])) {
		return true
	}
	checked_attr = changes[condition[0]]
	switch (checked_attr["type"]) {
		case 'number': {
			condition[2] = Number(condition[2])
			break;
		}
		case 'boolean': {
			if (condition[2] == "true")
				condition[2] = true
			else condition[2] = false
			break;
		}
	}
	switch (condition[1]) {
		case "<=": { return checked_attr["value"] <= condition[2] }
		case ">=": { return checked_attr["value"] >= condition[2] }
		case "!=": { return checked_attr["value"] != condition[2] }
		case "<": { return checked_attr["value"] < condition[2] }
		case ">": { return checked_attr["value"] > condition[2] }
		case "=": { return checked_attr["value"] == condition[2] }
	}
	return false
}

module.exports = checkCondition
