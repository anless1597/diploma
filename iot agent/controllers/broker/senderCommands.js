const axios = require('axios').default;
exports.sendHttpCommand = (httpActuatorSettings, command, responseForBroker) => {
    const message = {}
    message['command'] = command;
    axios({
        method: httpActuatorSettings.method,
        url: httpActuatorSettings.URL,
        data: message
    })
        .catch(err => {
            responseForBroker.status(400).json(`The device is not available`);
        });
    responseForBroker.status(200).json(`The command ${command} was sent!`);
};
exports.sendMqttCommand = (mqttClient, deviceId, command, responseForBroker) => {
    const topic = `/${deviceId}/commands`;
    const message = {}
    message['command'] = command;
    mqttClient.publish(topic, JSON.stringify(message));
    responseForBroker.status(200).json(`The command ${command} was sent!`);
};