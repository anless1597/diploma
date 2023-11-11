const dgram = require('dgram');
const socketDevice = dgram.createSocket("udp4");
const readline = require("readline");
const express = require("express");
const app = express();
const infoDevice = require("../infoDevice");
const {default: axios} = require("axios");
const door = require("../gateFunctions").makeDoor();
const validateCommandAndSendNewState = require('../gateFunctions').validateCommandAndSendNewState;
const logger = require('../logger');
const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function changeStateHandleWrapper(door, command, protocol, iotAgentEndpoint) {
    const result = validateCommandAndSendNewState(door, command, protocol, iotAgentEndpoint);
    if (!result) {
        loop(iotAgentEndpoint);
        return;
    }
    result.then(response => logger.printSuccessfulResponseFromIotAgent(response))
        .catch(err => logger.printErrorFromIotAgent(err))
        .finally(() => loop(iotAgentEndpoint));
}

const shortDeviceInfo = {
    name: "Дверь HTTP",
    transport: "HTTP",
    type: "Gate",
    macAddress: "mac:http:door001",
    functionForDataGenerate: {
        type: 'readline',
        attributes: {
            st: "open || close || lock || unlock"
        },
    }
};
const fullDeviceInfo = infoDevice.getDevice(shortDeviceInfo);
console.log(fullDeviceInfo);

const {deviceRoute, actuatorSettings} = fullDeviceInfo;

function loop(iotAgentEndpoint) {
    input.question("Enter command: ", (command) => {
        changeStateHandleWrapper(door, command, "http", iotAgentEndpoint);
    });
}

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
        changeStateHandleWrapper(door, command, "http", iotAgentEndpoint);
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