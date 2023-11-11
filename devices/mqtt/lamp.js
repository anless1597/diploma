const dgram = require('dgram');
const socketDevice = dgram.createSocket("udp4");


const mqtt = require('mqtt');
const readline = require("readline");
const lamp = require("../gateFunctions").makeLamp();
const validateCommandAndSendNewState = require('../gateFunctions').validateCommandAndSendNewState;
const infoDevice = require("../infoDevice");
const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function loop(mqttClient, topicAttributes) {
    input.question("Enter command: ", (command) => {
        validateCommandAndSendNewState(lamp, command, "mqtt", mqttClient, topicAttributes);
        loop(mqttClient, topicAttributes);
    });
}

const shortDeviceInfo = {
    name: "Лампа MQTT",
    transport: "MQTT",
    type: "Gate",
    macAddress: "mac:mqtt:lamp001",
    functionForDataGenerate: {
        type: 'readline',
        attributes: {
            st: "on || off"
        },
    }
};
const fullDeviceInfo = infoDevice.getDevice(shortDeviceInfo);
console.log(fullDeviceInfo);


socketDevice.on('message', (message, serverInfo) => {
    message = JSON.parse(message);
    if (fullDeviceInfo.macAddress !== message.deviceId) {
        return;
    }
    console.log(message);
    socketDevice.send("Ok", serverInfo.port, serverInfo.address, (err) => {
        socketDevice.close();
    });
    const mqttClient = mqtt.connect(message.brokerAddress);
    mqttClient.on('connect', () => {
        console.log("The Device connected successfully!");
        const topicAttributes = message.topicAttributes;
        mqttClient.subscribe(message.topicCommands);
        loop(mqttClient, topicAttributes);
    });
    mqttClient.on('message', (topic, messageFromBroker) => {
        let {command} = JSON.parse(messageFromBroker);
        const topicAttributes = message.topicAttributes;
        validateCommandAndSendNewState(lamp, command, "mqtt", mqttClient, topicAttributes);
    });
});
socketDevice.on('listening', () => {
    socketDevice.setBroadcast(true);
    console.log(`server listening ${socketDevice.address().address}:${socketDevice.address().port}`);
});
socketDevice.bind({
    port: 1883,
});
