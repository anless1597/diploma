const hbs = require("hbs");
const iotPlatform = require("./iotPlatformFunctions");
const entities = require("../entities");
hbs.registerHelper('getDeviceAttributes', function (device) {
    delete device["name"];
    delete device["_id"];
    delete device["type"];
    delete device["refRoom"];
    // console.log(Object.entries(device));
    return Object.entries(device);
});
hbs.registerHelper('myFunc', function (a, b) {
    // console.log(`${a}:${b}`)
    return false;
});
hbs.registerHelper('isCommand', function (str) {
    return str === "command";
});
//контроллер для работы с главной страницей
exports.index = async function (request, response) {
    const {filterType = ""} = request.query;
    const rooms = await iotPlatform.getAllObjectsByType("Room");
    let devices = await iotPlatform.getAllObjectsByType("Thermometer,Motion,Bell,Lamp,Door");
    devices.map(item => delete item["__v"]);
    let shortDevicesIds = devices.map(item => item["_id"]);
    const deviceTypes = getDeviceTypes(shortDevicesIds, filterType);
    if (filterType) {
        devices = devices.filter(item => {
            return item["_id"].split(":")[1] === filterType
        });
    }
    await expandDeviceInfo(devices);
    // console.log(devices);
    const shortRooms = rooms.map(item => ({
        id: item["_id"],
        roomName: item["roomName"].value
    }));
    response.render("index.hbs", {
        str: "str",
        shortRooms: shortRooms,
        devices: devices,
        deviceTypes: deviceTypes,
        filterType: filterType,
    });
};


async function expandDeviceInfo(devices) {
    await Promise.all(devices.map(async device => {
        const type = device["_id"].split(":")[1];
        const deviceMustBe = entities.typesOfDevices[type];
        const attributesOfDevice = deviceMustBe.attributes;
        device.type = deviceMustBe.text;
        for (const attribute of attributesOfDevice) {
            const attrName = attribute.name;
            const attrRussianName = attribute.russianName;
            device[attrName].text = attrRussianName;
            const attrValueFromBroker = device[attrName].value;
            device[attrName].value = attribute.value(attrValueFromBroker);
            if ("commandsDependsOnAttribute" in attribute && attrValueFromBroker) {
                const commandsDependsOnAttribute = attribute.commandsDependsOnAttribute(attrValueFromBroker);
                // console.log(attrValueFromBroker)
                for (const command of commandsDependsOnAttribute) {
                    const commandName = command.name;
                    const commandRussianName = command.russianName;
                    device[commandName].text = commandRussianName;
                }
            }
        }
        for (const command of deviceMustBe.commands) {
            const commandName = command.name;
            const commandRussianName = command.russianName;
            device[commandName].text = commandRussianName;
        }
        for (const key in device) {
            const deviceAttribute = device[key];
            // console.log(deviceAttribute)
            if (deviceAttribute.type === "command" && !deviceAttribute.text) {
                delete device[key];
            }
            if (deviceAttribute.type === "relationship") {
                const roomId = deviceAttribute.value;
                console.log(device);
                const room = await iotPlatform.getObjectById(roomId);
                device[key].text = room.roomName.value;
            }
        }
    }));
    // console.log(devices);
}

function getDeviceTypes(shortDevicesIds, filterType) {
    const deviceTypes = {};
    for (const id of shortDevicesIds) {
        const type = id.split(":")[1];
        if (!(type in deviceTypes))
            deviceTypes[type] = {
                text: entities.typesOfDevices[type].text,
                isSelected: filterType === type,
            };
    }
    return deviceTypes;
}