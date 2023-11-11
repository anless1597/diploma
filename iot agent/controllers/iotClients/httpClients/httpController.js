const IoTAgentDevice = require("../../../models/IoTAgentDevice.js");
const matcherDB = require("../matcherDB");
const sendIdAndAttributesToBroker = require("../sendIdAndAttributesToBroker");
const logger = require("../../logger");
const mongoose = require("mongoose");
const objectScheme = require("../../../models/ObjectScheme");
//HTTP протокол северное направление
exports.matchFromDevicesAndSendDataToDB = (request, response) => {
    const deviceId = request.query.deviceId;
    const httpClientAttributes = request.body;
    logger.got("http-client", deviceId, httpClientAttributes);
    const iotAgentDeviceValue = IoTAgentDevice.find(deviceId);
    if (!iotAgentDeviceValue) {
        logger.httpClientIsEmpty();
        response.status(400).json("The Device wasn't found in IoT Platform!");
        return;
    }
    const brokerId = matcherDB.getBrokerId(iotAgentDeviceValue);
    const newAttributes = matcherDB.getBrokerAttributes(iotAgentDeviceValue, httpClientAttributes);
    const entityType = brokerId.split(':')[1];
    const Device = mongoose.model(entityType, objectScheme);
    Device.findByIdAndUpdate(brokerId, newAttributes, logger.showError);
    logger.send(brokerId, newAttributes);
    sendIdAndAttributesToBroker(brokerId, newAttributes);
    response.status(200).json("Data was sent!");
}
