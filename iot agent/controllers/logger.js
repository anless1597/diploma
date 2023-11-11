const util = require('util');
const IoTAgentDevice = require("../models/IoTAgentDevice.js");
exports.got = (client, deviceId, attributes) => console.log(`\nreceived from ${client} id: ${deviceId} attributes: ${util.inspect(attributes, false, null, true)}`);
exports.send = (id, attributes) => console.log(`change to DB id: ${id}, new attributes: ${util.inspect(attributes, false, null, true)}`);
exports.showAll = (IoTAgentDevice) => console.log(util.inspect(IoTAgentDevice.getAll(), false, null, true))
exports.httpClientIsEmpty = () => console.log("The Device wasn't found in IoT Platform!");
exports.deviceWasMadeByUser = (deviceId) => console.log(`The device ${deviceId} was made`);
exports.deviceWasDeletedByUser = (deviceId) => console.log(`The device ${deviceId} was made`);
exports.showError = (error) => {
    if (error) console.log(error);
}

