const iotPlatform = require("./iotPlatformFunctions");
const entities = require("../entities");
//контроллер по работе с комнатой
exports.index = async function (request, response) {
    const {roomId} = request.params;
    const room = await iotPlatform.getObjectById(roomId);
    const roomDevices = await iotPlatform.getParentObjectById(roomId);
    await expandDeviceInfo(roomDevices);
    const devicesTypes = roomDevices.reduce(function(acc, el) {
        acc[el.type] = (acc[el.type] || 0) + 1;
        return acc;
    }, {});
    response.render("room.hbs", {
        room: room,
        devices: roomDevices,
        devicesTypes: devicesTypes,
        countDevices: roomDevices.length
    });
};
exports.getRoom = async function (request, response) {
    try {
        const {roomId} = request.params;
        const room = await iotPlatform.getObjectById(roomId);
        response.status(200).json(room);
    } catch (err) {
        if (err) console.log(err)
    }
};
exports.storeRoom = async function (request, response) {
    try {
        console.log(request.body)
        await iotPlatform.postObjectInBroker(request.body);
        response.redirect();
    } catch (err) {
        if (err) console.log(err)
    }
};
exports.editRoom = async function (request, response) {
    try {
        await iotPlatform.addAttributeById(request.params.roomId, request.body);
        response.redirect("back");
    } catch (err) {
        if (err) console.log(err)
    }
};
exports.destroyRoom = async function (request, response) {
    try {
        const roomId = request.params.roomId;
        let shortDevicesIds = await iotPlatform.getAllDevicesShortFormat();
        shortDevicesIds = Object.values(shortDevicesIds);
        const devices = await Promise.all(shortDevicesIds.map(async (deviceId) => await iotPlatform.getObjectById(deviceId)));
        for (const device of devices) {
            for (const attributeName in device){
                const attribute = device[attributeName]
                if (attribute.type === "relationship" && attribute.value === roomId) {
                    await iotPlatform.deleteAttributeByObjectId(device["_id"], attributeName);
                }
            }
        }
        const a = await iotPlatform.deleteObjectById(roomId);
        response.json({answer: "OK"});
    } catch (err) {
        if (err) console.log(err)
    }
};
exports.addRef = async function (request, response) {
    try {
        const {roomId, deviceId} = request.query;
        const attribute = {
            refRoom: {
                type: "relationship",
                value: roomId,
            }
        }
        console.log(roomId);
        console.log(attribute);
        const a = await iotPlatform.addAttributeById(deviceId, attribute);
        response.redirect("back");
    } catch (err) {
        if (err) console.log(err)
    }
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
            if (deviceAttribute.type === "relationship" || key === "__v") {
                delete device[key];
            }
        }
    }));
    console.log(devices);
}