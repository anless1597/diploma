const dgram = require('dgram');
const socketDevice = dgram.createSocket("udp4");
const readline = require("readline");
const express = require("express");
const app = express();
const infoDevice = require("../infoDevice");
const {default: axios} = require("axios");
const lamp = require("../gateFunctions").makeLamp();
const validateCommandAndSendNewState = require('../gateFunctions').validateCommandAndSendNewState;
const logger = require('../logger');
const mqtt = require("mqtt");
const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function changeStateHandleWrapper(lamp, command, protocol, iotAgentEndpoint) {
    const result = validateCommandAndSendNewState(lamp, command, protocol, iotAgentEndpoint);
    if (!result) {
        loop(iotAgentEndpoint);
        return;
    }
    result.then(response => logger.printSuccessfulResponseFromIotAgent(response))
        .catch(err => logger.printErrorFromIotAgent(err))
        .finally(() => loop(iotAgentEndpoint));
}

const shortDeviceInfo = {
    name: "Лампа HTTP",
    transport: "HTTP",
    type: "Gate",
    macAddress: "mac:http:lamp001",
    functionForDataGenerate: {
        type: 'readline',
        attributes: {
            st: "on || off"
        },
    }
};
const fullDeviceInfo = infoDevice.getDevice(shortDeviceInfo);
console.log(fullDeviceInfo);
const {deviceRoute, actuatorSettings} = fullDeviceInfo;

socketDevice.on('message', (message, serverInfo) => {
    message = JSON.parse(message);
    if (fullDeviceInfo.macAddress !== message.deviceId) {
        return;
    }
    console.log(message);
    socketDevice.send(JSON.stringify(actuatorSettings), serverInfo.port, serverInfo.address, (err) => {
        socketDevice.close();
    });
    const iotAgentEndpoint = message.serverAddress;
    loop(iotAgentEndpoint)
    app.post(deviceRoute, express.json(), function (request, response) {
        let {command} = request.body;
        changeStateHandleWrapper(lamp, command, "http", iotAgentEndpoint);
    });
    app.listen(actuatorSettings.port);
});
socketDevice.on('listening', () => {
    socketDevice.setBroadcast(true);
    console.log(`server listening ${socketDevice.address().address}:${socketDevice.address().port}`);
});
socketDevice.bind({
    port: 80,
});

function loop(iotAgentEndpoint) {
    input.question("Enter command: ", (command) => {
        changeStateHandleWrapper(lamp, command, "http", iotAgentEndpoint);
    });
}

