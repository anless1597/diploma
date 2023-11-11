import * as elements from "./elementsForPopup.js";
import * as popupFunctions from "./popupFunctions.js";
import { makeRequest } from "./index/makeRequest.js";

const scriptId = window.location.pathname.split("/")[3];
let sub = {}
const buttonAddCommand = document.getElementById("addCommand");
const buttonUpdateSub = document.getElementById("updateSub")
const buttonAddConditionBlock = document.getElementById("addConditionBlock")

const types = new Map([
    ['Thermometer', 'Термометры'],
    ['Motion', 'Датчики движения'],
    ['Door', 'Двери'],
    ['Lamp', 'Лампы'],
    ['Bell', 'Звонки']
])

const attributes = new Map([
    ["humidity", "Влажность"], ["temperature", "Температура"],
    ["count", "Количество"],
    ["status", "Состояние"]
])

const commands = new Map([
    ["open", "Открыть"], ["close", "Закрыть"], ["lock", "Заблокировать"], ["unlock", "Разблокировать"],
    ["on", "Включить"], ["off", "Выключить"],
    ["ring", "Позвонить"]
])

const week_days = new Map([
    ["1", "пн"],
    ["2", "вт"],
    ["3", "ср"],
    ["4", "чт"],
    ["5", "пт"],
    ["6", "сб"],
    ["0", "вс"],
])

let block_num = 2
let current_block = 1
const script = {
    time: [],
    conditions: [[]],
    handlers: [],
}

// Получение информации о подписке
window.onload = async function () {
    sub = await fetch(`http://127.0.0.1:5500/iot/entities/${scriptId}`).then(response => {
        return response.json()
    })
    document.getElementById("name_input").value = sub["description"]
    if (sub.hasOwnProperty("time")) createTime(sub["time"])
    createConditions(sub.subject, sub.fullCondition)
    createHandlers(sub.handler)
    console.log(script)
}

// Получение информации об условии времени
function createTime(time_arr) {
    for(let time of time_arr){
        let condition = {}
        condition["type"] = "time"
        condition["hour"] = time["hour"]
        condition["minute"] = time["minute"]
        condition["value_days"] = time["days"]
        const days = condition["value_days"].split(",")
        condition["name_days"] = ""
        for (let day of days) {
            condition["name_days"] += week_days.get(day) + ','
        }
        condition["name_days"] = condition["name_days"].slice(0, -1)
        condition["id"] = `condition ${condition["hour"]} ${condition["minute"]} ${condition["value_days"]}`
        script.time.push(condition)
        drawTimeCondition(condition)
    }
}

// Получение информации об условиях
async function createConditions(subjects, full_cond) {
    const logical = /(&&|\|\||\(|\))/
    const fullCondition = full_cond.split(logical)
    let counter = 0
    for (let part of fullCondition) {
        if (part == "&&") continue
        else if (part == "||") {
            script.conditions.push(new Array())
            current_block++
            drawConditionBlock()
            counter++
        }
        else {
            let condition = {}
            condition["type"] = "subject"
            if (subjects[Number(part)]["idPattern"] == ".*") {
                condition["idPattern"] = subjects[Number(part)]["idPattern"]
                condition["typePattern"] = subjects[Number(part)]["typePattern"]
                condition["nameSubject"] = types.get(subjects[Number(part)]["typePattern"])
            }
            else {
                condition["idPattern"] = subjects[Number(part)]["idPattern"]
                condition["typePattern"] = subjects[Number(part)]["typePattern"]
                let a = await fetch(`http://127.0.0.1:5500/iot/entities/${subjects[Number(part)]["idPattern"]}/attrs/name`).then(response => {
                    return response.json()
                })
                condition["nameSubject"] = a["value"]
            }
            condition["attrs"] = subjects[Number(part)]["attrs"]
            condition["nameAttrs"] = attributes.get(subjects[Number(part)]["attrs"][0])
            if (subjects[Number(part)].hasOwnProperty("condition"))
                condition["condition"] = subjects[Number(part)]["condition"].replace(subjects[Number(part)]["attrs"][0], "")
            condition["id"] = `${current_block} condition ${condition["nameSubject"]} ${condition["nameAttrs"]} ${condition.hasOwnProperty("condition") ? condition["condition"] : ""}`
            script.conditions[counter].push(condition)
            drawCondition(condition)
        }
    }
}

// Получение информации об исполнителях
async function createHandlers(subjects) {
    for (let subject of subjects) {
        let handler = {}
        if (subject["id"].split(":")[2] == ".*") {
            handler["idPattern"] = subject["id"]
            handler["nameHandler"] = types.get(subject["id"].split(":")[1])
        }
        else {
            handler["idPattern"] = subject["id"]
            let a = await fetch(`http://127.0.0.1:5500/iot/entities/${subject["id"]}/attrs/name`).then(response => {
                return response.json()
            })
            handler["nameHandler"] = a["value"]
        }
        handler["command"] = subject["command"]
        handler["nameCommand"] = commands.get(subject["command"])
        handler["id"] = `handler ${handler["nameHandler"]} ${handler["nameCommand"]}`
        script.handlers.push(handler)
        drawHandler(handler)
    }
}

// Событие нажатия на кнопку добавления исполнителя
buttonAddCommand.addEventListener("click", (e) => {
    const popupContent = popupFunctions.openPopup();
    popupContent.append(elements.createFormTitle("Исполнитель"));
    popupContent.append(elements.createFormButton("Выбрать по типу устройств", {
        classNames: ['mb-3'],
        id: "typeHandler"
    }));
    popupContent.append(elements.createFormButton("Выбрать определённое устройство", { id: "deviceHandler" }));
});

document.addEventListener("click", async (e) => {
    // Событие нажатия на кнопку добавления условия времени
    if (e.target && e.target.id == 'timeCondition') {
        popupFunctions.closePopup(e);
        const popupContent = popupFunctions.openPopup();
        popupContent.append(elements.createFormTitle("Условие: время"));
        popupContent.append(elements.createDaysCheckboxs())
        popupContent.append(elements.createInput("", "", { type: "time", id: "valueTimeCondition" }));
        popupContent.append(elements.createFormButton("Добавить", { id: "addTimeCondition" }));
    }
    // Событие нажатия на кнопку добавления условия
    if (e.target && e.target.id == 'deviceCondition') {
        popupFunctions.closePopup(e);
        const popupContent = popupFunctions.openPopup();
        popupContent.append(elements.createFormTitle("Условие: данные устройства"));
        popupContent.append(elements.createFormButton("Выбрать по типу устройств", {
            classNames: ['mb-3'],
            id: "typeCondition"
        }));
        popupContent.append(elements.createFormButton("Выбрать определённое устройство", { id: "defDeviceCondition" }));
    }
    // Событие нажатия на кнопку добавления условия для всех устройств одного типа
    if (e.target && e.target.id == 'typeCondition') {
        popupFunctions.closePopup(e);
        const popupContent = popupFunctions.openPopup();
        popupContent.append(elements.createFormTitle("Условие"));
        popupContent.append(elements.createSelect(
            "Выбрать тип устройства",
            [{ value: "Thermometer", text: "Термометры" }, { value: "Motion", text: "Датчики движения" }, { value: "Door", text: "Двери" }, { value: "Lamp", text: "Лампы" }],
            { id: "type" }));
    }
    // Событие нажатия на кнопку добавления условия для определенного устройства
    if (e.target && e.target.id == 'defDeviceCondition') {
        popupFunctions.closePopup(e);
        const popupContent = popupFunctions.openPopup();
        popupContent.append(elements.createFormTitle("Условие"));
        const devices = await fetch(`http://127.0.0.1:5500/iot/entities?type=Thermometer,Motion,Door,Lamp`).then(response => {
            return response.json()
        })
        let selectDevices = []
        for (let device of devices) {
            selectDevices.push({ value: `${device._id}`, text: `${device.name.value}` })
        }
        popupContent.append(elements.createSelect("Выбрать устройство", selectDevices, { id: "device" }));
    }
    // Добавление условия времени
    if (e.target && e.target.id == 'addTimeCondition') {
        const days = document.getElementsByClassName("daysOfWeek")
        let name_days = ""
        let value_days = ""
        for (let day of days) {
            if (day.checked) {
                name_days += day.name + ','
                value_days += day.value + ','
            }
        }
        name_days = name_days.slice(0, -1)
        value_days = value_days.slice(0, -1)
        const time = document.getElementById("valueTimeCondition").value;
        if (!time) return;
        const [hour, minute] = time.split(":");
        let cond = {
            type: "time",
            hour: hour,
            minute: minute,
            name_days: name_days,
            value_days: value_days
        }
        cond["id"] = `${current_block} condition ${cond["hour"]} ${cond["minute"]} ${cond["value_days"]}`
        script.time.push(cond)
        console.log(script);
        popupFunctions.closePopup(e);
        drawTimeCondition(cond)
    }
    // Добавление условия
    if (e.target && e.target.id == 'addTypeCondition') {
        let cond = {}
        cond["type"] = "subject"
        if (document.getElementById("type")) {
            cond["idPattern"] = ".*"
            cond["typePattern"] = document.getElementById("type").value
            cond["nameSubject"] = document.getElementById("type").options[document.getElementById("type").selectedIndex].text
        }
        else {
            cond["idPattern"] = document.getElementById("device").value
            cond["typePattern"] = document.getElementById("device").value.split(':')[1]
            cond["nameSubject"] = document.getElementById("device").options[document.getElementById("device").selectedIndex].text
        }
        cond["attrs"] = [document.getElementById("attribute").value]
        cond["nameAttrs"] = document.getElementById("attribute").options[document.getElementById("attribute").selectedIndex].text
        if (document.getElementById("conditionValue")) {
            let cond_string = ""
            if (document.getElementById("condition"))
                cond_string += document.getElementById("condition").value
            else cond_string += "="
            cond_string += document.getElementById("conditionValue").value;
            cond["condition"] = cond_string
        }
        cond["id"] = `${current_block} condition ${cond["nameSubject"]} ${cond["nameAttrs"]} ${cond.hasOwnProperty("condition") ? cond["condition"] : ""}`
        script.conditions[current_block - 1].push(cond)
        console.log(script);
        popupFunctions.closePopup(e);
        drawCondition(cond)
    }
    // Событие нажатия на кнопку добавления исполнителей одного типа
    if (e.target && e.target.id == 'typeHandler') {
        popupFunctions.closePopup(e);
        const popupContent = popupFunctions.openPopup();
        popupContent.append(elements.createFormTitle("Исполнитель"));
        popupContent.append(elements.createSelect(
            "Выбрать тип устройства",
            [{ value: "Door", text: "Двери" }, { value: "Lamp", text: "Лампы" }, { value: "Bell", text: "Звонки" }],
            { id: "handlerType" }));
    }
    // Событие нажатия на кнопку добавления определенного устройства-исполнителя
    if (e.target && e.target.id == 'deviceHandler') {
        popupFunctions.closePopup(e);
        const popupContent = popupFunctions.openPopup();
        popupContent.append(elements.createFormTitle("Исполнитель"));
        const devices = await fetch(`http://127.0.0.1:5500/iot/entities?type=Door,Lamp,Bell`).then(response => {
            return response.json()
        })
        let selectDevices = []
        for (let device of devices) {
            selectDevices.push({ value: `${device._id}`, text: `${device.name.value}` })
        }
        popupContent.append(elements.createSelect("Выбрать устройство", selectDevices, { id: "defDeviceHandler" }));
    }
    // Добавление исполнителя
    if (e.target && e.target.id == 'addHandler') {
        let hand = {}
        if (document.getElementById("handlerType")) {
            hand["idPattern"] = `broker:${document.getElementById("handlerType").value}:.*`
            hand["nameHandler"] = document.getElementById("handlerType").options[document.getElementById("handlerType").selectedIndex].text
        }
        else {
            hand["idPattern"] = document.getElementById("defDeviceHandler").value
            hand["nameHandler"] = document.getElementById("defDeviceHandler").options[document.getElementById("defDeviceHandler").selectedIndex].text
        }
        hand["command"] = document.getElementById("command").value
        hand["nameCommand"] = document.getElementById("command").options[document.getElementById("command").selectedIndex].text
        hand["id"] = `handler ${hand["nameHandler"]} ${hand["nameCommand"]}`
        script.handlers.push(hand)
        console.log(script);
        popupFunctions.closePopup(e);
        drawHandler(hand)
    }
});

const popupCloseIcon = document.getElementById("close-popup");
popupCloseIcon.addEventListener("click", (e) => {
    popupFunctions.closePopup(e)
});

// Создание подписки
buttonUpdateSub.onclick = async (event) => {
    event.stopPropagation();
    let counter = 0
    var subscription = {}
    subscription["description"] = document.getElementById("name_input").value
    subscription["subject"] = []
    subscription["handler"] = []
    let full_cond = ""
    if(script.time.length!=0){
        subscription["time"] = []
        for(let time of script.time){
            let cond = {}
            cond["hour"] = time["hour"]
            cond["minute"] = time["minute"]
            cond["days"] = time["value_days"]
            subscription["time"].push(cond)
        }
    }
    for (let cond_array of script.conditions) {
        if (cond_array.length != 0) {
            for (let cond of cond_array) {
                    let subject = {}
                    subject["idPattern"] = cond["idPattern"]
                    subject["typePattern"] = cond["typePattern"]
                    subject["attrs"] = cond["attrs"]
                    if (cond.hasOwnProperty("condition"))
                        subject["condition"] = cond["attrs"][0] + cond["condition"]
                    subscription["subject"].push(subject)
                    full_cond += counter + "&&"
                    counter++
                
            }
            full_cond = full_cond.slice(0, -2)
            full_cond += "||"
        }
    }
    full_cond = full_cond.slice(0, -2)
    for (let hand of script.handlers) {
        let handler = {}
        handler["id"] = hand["idPattern"]
        handler["command"] = hand["command"]
        subscription["handler"].push(handler)
    }
    subscription["fullCondition"] = full_cond
    subscription["notification"] = { "url": "http://localhost:80/subscription/scripts" }
    await makeRequest(`http://localhost:80/scripts/edit/${scriptId}`, "PATCH", subscription);
    window.location.href = '/scripts'
}

// Событие нажатия на кнопку добавления набора условий
buttonAddConditionBlock.onclick = (event) => {
    drawConditionBlock()
    script.conditions.push(new Array())
}

// Отрисовка условия времени
function drawTimeCondition(time) {
    let conditionList = document.getElementById("timeList")
    let ul_condition = document.createElement("ul")
    ul_condition.className = "list-group list-group-horizontal"
    let li_condition_1 = document.createElement("li")
    li_condition_1.className = "list-group-item fs-4"
    li_condition_1.textContent = `${time["name_days"]}:`
    let li_condition_2 = document.createElement("li")
    li_condition_2.className = "list-group-item fs-4"
    li_condition_2.textContent = `${time["hour"]}:${time["minute"]}`
    let button = document.createElement("button")
    button.className = "btn-close"
    button.id = time["id"]
    button.addEventListener("click", deleteTimeCondition)
    ul_condition.appendChild(li_condition_1)
    ul_condition.appendChild(li_condition_2)
    ul_condition.appendChild(button)
    conditionList.appendChild(ul_condition)
}

// Удаление условия времени
const deleteTimeCondition = (e) => {
    const button = e.target
    for (let cond of script.time) {
            if (Object.values(cond).includes(button.id)) {
                script.time.splice(script.time.indexOf(cond), 1)
                document.getElementById(button.id).parentElement.remove()
                console.log(script)
                return
            }
    }
}


// Отрисовка условия
function drawCondition(condition) {
    let block = document.getElementById(`${current_block}`)
    let conditionList = {}
    for (let div of block.childNodes) {
        if (div.id == "conditionsList") {
            conditionList = div
            break
        }
    }
    let ul_condition = document.createElement("ul")
    ul_condition.className = "list-group list-group-horizontal"
    let li_condition_subject = document.createElement("li")
    li_condition_subject.className = "list-group-item fs-4"
    li_condition_subject.textContent = `${condition["nameSubject"]}`
    ul_condition.appendChild(li_condition_subject)
    let li_condition_attr = document.createElement("li")
    li_condition_attr.className = "list-group-item fs-4"
    li_condition_attr.textContent = `${condition["nameAttrs"]}`
    ul_condition.appendChild(li_condition_attr)
    if (condition.hasOwnProperty("condition")) {
        let li_condition = document.createElement("li")
        li_condition.className = "list-group-item fs-4"
        li_condition.textContent = `${condition["condition"]}`
        ul_condition.appendChild(li_condition)
    }
    let button = document.createElement("button")
    button.id = condition["id"]
    button.addEventListener("click", deleteCondition)
    button.className = "btn-close"
    ul_condition.appendChild(button)
    conditionList.appendChild(ul_condition)
}

// Удаление условия
const deleteCondition = (e) => {
    const button = e.target
    for (let cond_array of script.conditions) {
        for (let cond of cond_array) {
            if (Object.values(cond).includes(button.id)) {
                cond_array.splice(cond_array.indexOf(cond), 1)
                document.getElementById(button.id).parentElement.remove()
                console.log(script)
                return
            }
        }
    }
}

// Отрисовка исполнителя
function drawHandler(handler) {
    console.log(handler)
    let handlersList = document.getElementById("handlersList")
    let ul_handler = document.createElement("ul")
    ul_handler.className = "list-group list-group-horizontal"
    let li_handler_name = document.createElement("li")
    li_handler_name.className = "list-group-item fs-4"
    li_handler_name.textContent = `${handler["nameHandler"]}`
    let li_handler_command = document.createElement("li")
    li_handler_command.className = "list-group-item fs-4"
    li_handler_command.textContent = `${handler["nameCommand"]}`
    ul_handler.appendChild(li_handler_name)
    ul_handler.appendChild(li_handler_command)
    let button = document.createElement("button")
    button.className = "btn-close"
    button.id = handler["id"]
    button.addEventListener("click", deleteHandler)
    ul_handler.appendChild(button)
    handlersList.appendChild(ul_handler)
}

// Удаление исполнителя
const deleteHandler = (e) => {
    const button = e.target
    for (let hand of script.handlers) {
        if (Object.values(hand).includes(button.id)) {
            script.handlers.splice(script.handlers.indexOf(hand), 1)
            document.getElementById(button.id).parentElement.remove()
            console.log(script)
            return
        }
    }
}

// Отрисовка набора условий
function drawConditionBlock() {
    let block = document.createElement('div')
    block.id = `${block_num}`
    let head_div = document.createElement('div')
    head_div.className = "d-flex"
    let button_div = document.createElement('div')
    button_div.className = "mb-3"
    let button = document.createElement('button')
    button.id = "addCondition"
    button.type = "button"
    button.className = "btn btn-warning btn-lg me-2"
    button.textContent = "Добавить условие"
    button.addEventListener("click", (e) => {
        popupFunctions.closePopup(e);
        const popupContent = popupFunctions.openPopup();
        popupContent.append(elements.createFormTitle("Условие: данные устройства"));
        popupContent.append(elements.createFormButton("Выбрать по типу устройств", {
            classNames: ['mb-3'],
            id: "typeCondition"
        }));
        popupContent.append(elements.createFormButton("Выбрать определённое устройство", { id: "defDeviceCondition" }));
        current_block = Number(block.id)
        console.log(current_block)
    });
    button_div.appendChild(button)
    head_div.appendChild(button_div)
    let name_div = document.createElement('div')
    name_div.className = "p-2 d-inline-block border border-2 border-warning rounded-3 w-75  mb-3"
    let name = document.createElement('div')
    name.className = "fs-4 text-center"
    name.textContent = `Набор условий ${block_num}`
    name_div.appendChild(name)
    head_div.appendChild(name_div)
    block.appendChild(head_div)
    let conditions = document.createElement('div')
    conditions.className = "mb-3"
    conditions.id = "conditionsList"
    block.appendChild(conditions)
    let conditionBlock = document.getElementById("ConditionBlocks")
    conditionBlock.appendChild(block)
    block_num++
}
