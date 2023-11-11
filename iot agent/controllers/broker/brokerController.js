const Device = require('../../models/IoTAgentDevice');
const senderCommands = require('./senderCommands');
//Южное направление
exports.updateState = function (mqttClient) {
    return function (request, response) {
        const {id: entityName, command} = request.body;
        const device = Device.findDeviceByEntityName(entityName);
        if (!device) {
            response.status(400).json(`The object ${entityName} wasn't found in IoT-Agent!`);
            return;
        }
        const {deviceId, commands} = device;

        if (!commands.includes(command)){
            response.status(400).json(`The object ${entityName} doesn't include command ${command}!`);
            return;
        }
        const httpActuatorSettings = Device.getHttpActuatorSettingsByEntityName(entityName);
        if (httpActuatorSettings) {
            senderCommands.sendHttpCommand(httpActuatorSettings, command, response);
        } else {
            senderCommands.sendMqttCommand(mqttClient, deviceId, command, response);
        }
    }
};