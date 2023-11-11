import * as elements from "./elementsForPopup.js";
import * as popupFunctions from "./popupFunctions.js";

// Список атрибутов в зависимости от типа устройств для условий
export function changeSelectType() {
	const popupContent = popupFunctions.openPopup();
	if (document.getElementById("attribute")) {
		document.getElementById("attribute").remove()
	}
	clearCondition()
	let attributes = []
	switch (document.getElementById("type").value) {
		case "Thermometer": {
			attributes = [{ value: "humidity", text: "Влажность" }, { value: "temperature", text: "Температура" }]
			break
		}
		case "Motion": {
			attributes = [{ value: "count", text: "Присутствие" }]
			break
		}
		case "Door": {
			attributes = [{ value: "status", text: "Состояние" }]
			break
		}
		case "Lamp": {
			attributes = [{ value: "status", text: "Состояние" }]
			break
		}
		case "Bell": {
			attributes = [{ value: "ring", text: "Звонок" }]
			break
		}
	}
	popupContent.append(elements.createSelect(
		"Выбрать данные",
		attributes,
		{ id: "attribute" }
	));
}

// Список условий в зависимости от атрибутов для условий
export function changeSelectAttribute() {
	const popupContent = popupFunctions.openPopup();
	clearCondition()
	switch (document.getElementById("attribute").value) {
		case "humidity":
		case "temperature":
		case "count":
			{
				popupContent.append(elements.createSelect("Задать условие",
					[{ value: ">", text: "больше" }, { value: "<", text: "меньше" }, { value: "=", text: "равно" },
					{ value: "!=", text: "не равно" }, { value: ">=", text: "больше или равно" }, { value: "<=", text: "меньше или равно" }],
					{ id: "condition" }));
				popupContent.append(elements.createInput("", "0", { type: "number", id: "conditionValue" }));
				break;
			}
		case "status": {
			const type = document.getElementById("type") != null ? document.getElementById("type").value : document.getElementById("device").value.split(':')[1]
			if (type == "Lamp") {
				popupContent.append(elements.createSelect("Задать состояние",
					[{ value: "on", text: "Включена" }, { value: "off", text: "Выключена" }],
					{ id: "conditionValue" }));
			}
			else {
				popupContent.append(elements.createSelect("Задать состояние",
					[{ value: "open", text: "Открыта" }, { value: "close", text: "Закрыта" }, { value: "lock", text: "Заперта" }, { value: "unlock", text: "Не заперта" }],
					{ id: "conditionValue" }));
			}
			break;
		}
	}
	popupContent.append(elements.createFormButton("Добавить", { id: "addTypeCondition" }));
}

// Список атрибутов в зависимости от типа устройства для условий
export function changeSelectDevice() {
	const popupContent = popupFunctions.openPopup();
	if (document.getElementById("attribute")) {
		document.getElementById("attribute").remove()
	}
	clearCondition()
	let attributes = []
	const type = document.getElementById("device").value.split(':')[1]
	switch (type) {
		case "Thermometer": {
			attributes = [{ value: "humidity", text: "Влажность" }, { value: "temperature", text: "Температура" }]
			break
		}
		case "Motion": {
			attributes = [{ value: "count", text: "Присутствие" }]
			break
		}
		case "Door": {
			attributes = [{ value: "status", text: "Состояние" }]
			break
		}
		case "Lamp": {
			attributes = [{ value: "status", text: "Состояние" }]
			break
		}
	}
	popupContent.append(elements.createSelect(
		"Выбрать данные",
		attributes,
		{ id: "attribute" }
	));
}

// Стирание выпадающих списков для условий
function clearCondition() {
	if (document.getElementById("condition")) {
		document.getElementById("condition").remove()
	}
	if (document.getElementById("conditionValue")) {
		document.getElementById("conditionValue").parentNode.remove()
	}
	if (document.getElementById("addTypeCondition")) {
		document.getElementById("addTypeCondition").parentNode.remove()
	}
}

// Список атрибутов в зависимости от типа устройств для исполнителей
export function changeSelectTypeHandler() {
	const popupContent = popupFunctions.openPopup();
	clearHandler()
	let commands = []
	switch (document.getElementById("handlerType").value) {
		case "Door": {
			commands = [{ value: "open", text: "Открыть" }, { value: "close", text: "Закрыть" }, { value: "lock", text: "Заблокировать" }, { value: "unlock", text: "Разблокировать" }]
			break
		}
		case "Lamp": {
			commands = [{ value: "on", text: "Включить" }, { value: "off", text: "Выключить" }]
			break
		}
		case "Bell": {
			commands = [{ value: "ring", text: "Позвонить" }]
			break
		}
	}
	popupContent.append(elements.createSelect(
		"Выбрать команду",
		commands,
		{ id: "command" }
	));
	popupContent.append(elements.createFormButton("Добавить", { id: "addHandler" }));
}

// Список состояний в зависимости от типа устройства для исполнителей
export function changeSelectDeviceHandler() {
	const popupContent = popupFunctions.openPopup();
	clearHandler()
	let commands = []
	const type = document.getElementById("defDeviceHandler").value.split(':')[1]
	switch (type) {
		case "Door": {
			commands = [{ value: "open", text: "Открыть" }, { value: "close", text: "Закрыть" }, { value: "lock", text: "Заблокировать" }, { value: "unlock", text: "Разблокировать" }]
			break
		}
		case "Lamp": {
			commands = [{ value: "on", text: "Включить" }, { value: "off", text: "Выключить" }]
			break
		}
		case "Bell": {
			commands = [{ value: "ring", text: "Позвонить" }]
			break
		}
	}
	popupContent.append(elements.createSelect(
		"Выбрать команду",
		commands,
		{ id: "command" }
	));
	popupContent.append(elements.createFormButton("Добавить", { id: "addHandler" }));
}

// Стирание выпадающих списков для исполнителей
function clearHandler() {
	if (document.getElementById("command")) {
		document.getElementById("command").remove()
	}
	if (document.getElementById("addHandler")) {
		document.getElementById("addHandler").parentNode.remove()
	}
}

