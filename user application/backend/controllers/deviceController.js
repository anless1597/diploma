const iotPlatform = require("./iotPlatformFunctions");
// контроллер по работе с устройствами
exports.index = async function (request, response) {
    try {
        let shortDevicesIds = await iotPlatform.getAllDevicesShortFormat();
        shortDevicesIds = Object.values(shortDevicesIds);
        const devices = await Promise.all(shortDevicesIds.map(async (deviceId) => await iotPlatform.getObjectById(deviceId)));
        response.json(devices);
    } catch (err) {
        console.log(err);
    }
}

exports.storeDevice = async function (request, response) {
    try {
        console.log(request.body);
        const res = await iotPlatform.postDeviceInAgent(request.body);
        const idPattern = res.entityName;
        const typePattern = res.entityType;
        const {dynamicAttributes = ""} = res;
        if ("dynamicAttributes" in res || "commands" in res) {
            let attributesAndCommands = [];
            if ("dynamicAttributes" in res) {
                attributesAndCommands = res.dynamicAttributes.map((item) => item.name);
            }
            if ("commands" in res) {
                attributesAndCommands.push(...res.commands.map(item => item.name))
            }
            const notification = "http://localhost:80/subscription/indication";
            console.log(attributesAndCommands);
            await iotPlatform.createSubscriptionForDevice(idPattern, typePattern, attributesAndCommands, notification);
        }
        response.redirect("back");
    } catch (err) {
        console.log(err);
    }
};

exports.destroyDevice = async function (request, response) {
    try {
        const {entityName} = request.params;
        const shortDevicesIds = await iotPlatform.getAllDevicesShortFormat();
        const shortDevicesIdsReverse = {};
        Object.entries(shortDevicesIds).forEach(([key, value]) => {
            shortDevicesIdsReverse[value] = key;
        });
        const macAddress = shortDevicesIdsReverse[entityName];
        await iotPlatform.deleteDeviceInAgent(macAddress);

        const allSubs = await iotPlatform.getAllSubs();
        for (const sub of allSubs) {
            const subId = sub._id;
            if ("description" in sub || entityName !== sub.subject[0].idPattern) {
                continue;
            }
            await iotPlatform.deleteScriptById(subId);
        }
    } catch (err) {
        console.log(err.response.data);
    }
    response.redirect(301, './')
};

exports.deleteRefRoom = async function (request, response) {
    try {
        const {entityName} = request.params;
        console.log(entityName);
        await iotPlatform.deleteAttributeByObjectId(entityName, "refRoom");
        response.json({answer: "OK"});
    } catch (err) {
        console.log(err.response.data);
    }
};
exports.updateDevice = async function (request, response) {
    try {
        // console.log(request.body)
        await iotPlatform.updateCommandInAgent(request.body);
        response.redirect("back");
    } catch (err) {
        console.log(err.response.data);
    }
}