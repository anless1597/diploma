const dgram = require('dgram');

const IoTAgentDevice = require('../../models/IoTAgentDevice.js');
const mongoose = require("mongoose");
const objectScheme = require("../../models/ObjectScheme");
const logger = require("../logger");
const {body, validationResult, checkSchema, check, query, param} = require('express-validator/check');
const objectPreparer = require("./objectPreparer");
const models = require("./models");
const sendResponseWithErrors = (response, errors) => response.status(400).json({errors: errors.array()});

const clientSocket = dgram.createSocket("udp4");
clientSocket.bind(() => clientSocket.setBroadcast(true));
//Добавление устройства в платформу
exports.addDevice = function (mqttClient) {
    return async function (request, response) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            sendResponseWithErrors(response, errors);
            return;
        }
        try {
            const {deviceId, entityType, transport: protocol} = request.body;
            let addressDevice = "";
            if(!IoTAgentDevice.find(deviceId)){
                const {gotMessageFromDevice, addressDeviceSocket} = await PairingWithDevice(request.body);
                addressDevice = addressDeviceSocket;
                if (!gotMessageFromDevice) {
                    response.status(400).send("The device wasn't found in local network!");
                    console.log("The device wasn't found in local network!");
                    return;
                }
            }
            if (protocol === "MQTT") {
                mqttClient.subscribe(`/${deviceId}/attributes`);
            }
            const Device = mongoose.model(entityType, objectScheme);
            const device = new Device(objectPreparer(request.body));
            const doc = await device.save();
            const entityName = doc["_id"];
            if (!("entityName" in request.body)) {
                request.body = {...request.body, entityName}
            }
            const iotAgentDevice = new IoTAgentDevice(request.body, addressDevice);
            iotAgentDevice.save();
            logger.deviceWasMadeByUser(deviceId);
            logger.showAll(IoTAgentDevice);
            response.status(200).json(request.body);
        } catch (err) {
            logger.showError(err);
            response.status(400).send(err);
        }
    }
};

async function PairingWithDevice(body) {
    const {deviceId, entityType, transport: protocol, dynamicAttributes = "", commands = ""} = body;
    const socketIoTAgent = dgram.createSocket("udp4");
    socketIoTAgent.bind(() => socketIoTAgent.setBroadcast(true));
    let gotMessageFromDevice = false;
    const initializationDataForDevice = {};
    initializationDataForDevice['deviceId'] = deviceId;
    let PORT = "";
    if (protocol == "MQTT") {
        PORT = 1883;
        initializationDataForDevice['brokerAddress'] = `mqtt://${global.mqttBrokerAddress}:1883`;
        if (dynamicAttributes) {
            initializationDataForDevice['topicAttributes'] = `/${deviceId}/attributes`;
        }
        if (commands) {
            initializationDataForDevice['topicCommands'] = `/${deviceId}/commands`;
        }
    }
    if (protocol == "HTTP") {
        PORT = 80;
        if (dynamicAttributes) {
            initializationDataForDevice['serverAddress'] = `http://127.0.0.1:7896/iot?deviceId=${deviceId}`;
        }
    }
    socketIoTAgent.send(JSON.stringify(initializationDataForDevice), PORT, "255.255.255.255");
    let addressDevice = "";
    socketIoTAgent.on('message', (msg, rinfo) => {
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        if (protocol == "HTTP") {
            if (commands) {
                msg = JSON.parse(msg);
                addressDevice = `${msg.host}:${msg.port}`
            }
        }
        gotMessageFromDevice = true;
    });
    socketIoTAgent.on('listening', () => {
    });
    await CloseSocket(socketIoTAgent);
    return {gotMessageFromDevice: gotMessageFromDevice, addressDeviceSocket: addressDevice};
}

function CloseSocket(socketIoTAgent) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            socketIoTAgent.close();
            resolve();
        }, 2000);
    });
}
//Добавление устройства в платформу через модели
exports.addDeviceByModel = function (mqttClient) {
    return function (request, response) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            sendResponseWithErrors(response, errors);
            return;
        }
        const body = request.body;
        const modelAttributes = models.getAttributes(body.model);
        delete body.model;
        const newBody = {
            ...body,
            ...modelAttributes
        };
        request.body = newBody;
        module.exports.addDevice(mqttClient)(request, response);
    }
};

exports.index = function (request, response) {
    if ("form" in request.query) {
        const {form} = request.query;
        if (form === "short") {
            response.status(200).json(IoTAgentDevice.getAllShort());
            return;
        }
    }
    console.log(IoTAgentDevice.getAll());
    response.status(200).json(Object.fromEntries(IoTAgentDevice.getAll()));
}

exports.deleteDevice = function (mqttClient) {
    return function (request, response) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            sendResponseWithErrors(response, errors);
            return;
        }
        const deviceId = request.params.deviceId;
        const iotAgentDevice = IoTAgentDevice.find(deviceId);
        IoTAgentDevice.delete(deviceId);
        const {protocol, entityName: brokerId} = iotAgentDevice;
        if (protocol === "MQTT") {
            mqttClient.unsubscribe(`/${deviceId}/attributes`);
        }
        const entityType = brokerId.split(":")[1];
        const Device = mongoose.model(entityType, objectScheme);
        Device.findByIdAndDelete(brokerId, function (err, doc) {
            if (err) return logger.showError(err);
            console.log(`The device ${deviceId} was deleted`);
        });
        logger.showAll(IoTAgentDevice);
        response.status(200).json(`The IoTAgentDevice ${deviceId} was deleted`);
    }
};

exports.validate = (method) => {
    const generalValidationRulesForCreateAndCreateByModel = [
        body('deviceId')
            .not().isEmpty()
            .withMessage('The deviceId is required')
            .custom(deviceId => !IoTAgentDevice.find(deviceId))
            .withMessage('The deviceId already in use'),
        body('entityName')
            .optional({checkFalsy: true})
            // .not().isEmpty()
            // .withMessage('The entityType is required')
            .matches(/broker:.+?:\d{3}/)
            .withMessage("Invalid entityName")
            .custom((value, {req}) => {
                if ("entityType" in req.body) {
                    return value.split(':')[1] === (req.body.entityType)
                }
                return true;
            })
            .withMessage("Invalid entityName, check entityType")
            .custom(entityName => !IoTAgentDevice.findDeviceByEntityName(entityName))
            .withMessage('The entityName already in use'),
        body('relationships')
            .optional({checkFalsy: true})
            .isArray()
            .withMessage('The commands is not array'),
        body('relationships.*.name')
            .not().isEmpty()
            .withMessage('The relationships.name is required'),
        body('relationships.*.value')
            .not().isEmpty()
            .withMessage('The relationships.value is required')
            .matches(/broker:.+?:\d{3}/)
            .withMessage("Invalid relationships.value")
            .custom(brokerId => {
                const entityType = brokerId.split(":")[1];
                const Device = mongoose.model(entityType, objectScheme);
                return Device.findById(brokerId);
            })
            .withMessage("The IoT Platform doesn't have relationships.value"),
    ]
    switch (method) {
        case 'addDevice': {
            return [
                ...generalValidationRulesForCreateAndCreateByModel,
                body('endpoint')
                    .optional({checkFalsy: true})
                    .matches(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
                    .withMessage("Invalid endpoint"),
                body('entityType')
                    .not().isEmpty()
                    .withMessage('The entityType is required'),
                body('transport')
                    .not().isEmpty()
                    .withMessage('The transport is required')
                    .isIn(['HTTP', 'MQTT'])
                    .withMessage('Wrong transport'),
                body(['dynamicAttributes', 'commands'])
                    .custom((value, {req}) => req.body.dynamicAttributes || req.body.commands)
                    .withMessage('At least dynamicAttributes or commands must exist'),
                body('dynamicAttributes')
                    .optional({checkFalsy: true})
                    .isArray()
                    .withMessage('The dynamicAttributes is not array'),
                body('dynamicAttributes.*.type')
                    .not().isEmpty()
                    .withMessage('The dynamicAttributes.type is required')
                    .isIn(['number', 'text', 'boolean'])
                    .withMessage('Wrong the dynamicAttributes.type, type is unknown'),
                body('dynamicAttributes.*.objectId')
                    .not().isEmpty()
                    .withMessage('The dynamicAttributes.objectId is required'),
                body('dynamicAttributes.*.name')
                    .not().isEmpty()
                    .withMessage('The dynamicAttributes.name is required'),
                body('commands')
                    .optional({checkFalsy: true})
                    .isArray()
                    .withMessage('The commands is not array'),
                body('commands.*.type')
                    .not().isEmpty()
                    .withMessage('The commands.type is required')
                    .custom((value, {req}) => value === "command")
                    .withMessage('The commands.type is not command'),
                body('commands.*.name')
                    .not().isEmpty()
                    .withMessage('The commands.name is required'),
            ]
        }
        case 'addDeviceByModel': {
            return [
                ...generalValidationRulesForCreateAndCreateByModel,
                body('model')
                    .not().isEmpty()
                    .withMessage('The model is required')
                    .custom((value, {req}) => models.include(value))
                    .withMessage('The model unknown'),
            ]
        }
        case 'deleteDevice': {
            return [
                param('deviceId')
                    .not().isEmpty()
                    .withMessage('The deviceId in params is required')
                    .custom(deviceId => IoTAgentDevice.find(deviceId))
                    .withMessage("The deviceId wasn't found in IoT Platform"),
            ]
        }
    }
}

