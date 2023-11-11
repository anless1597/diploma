const mqtt = require('mqtt');
const thermometerFunctions = require('../thermometerFunctions');
const infoDevice = require('../infoDevice');
const dgram = require('dgram');
const {default: axios} = require("axios");
const ms = thermometerFunctions.getMs();
const shortDeviceInfo = {
    name: "Термометр MQTT",
    transport: "MQTT",
    type: "Sensor",
    macAddress: "mac:mqtt:thermometer001",
    functionForDataGenerate: {
        type: 'interval',
        ms: ms,
        attributes: {
            t: "15-17",
            h: "40-50",
        },
    }
};
const socketDevice = dgram.createSocket("udp4");
socketDevice.on('message', (message, serverInfo) => {
    message = JSON.parse(message);
    if (fullDeviceInfo.macAddress !== message.deviceId) {
        return;
    }
    console.log(message);
    socketDevice.send("Ok", serverInfo.port, serverInfo.address, (err) => {
        socketDevice.close();
    });
    const client = mqtt.connect(message.brokerAddress);
    client.on('connect', () => {
        console.log("The Device connected successfully!")
    })
    setInterval(() => {
        const newData = thermometerFunctions.getMessage();
        client.publish(message.topicAttributes, JSON.stringify(newData))
        console.log(`${message.topicAttributes} -m ${JSON.stringify(newData)}`);
    }, ms)
});
socketDevice.on('listening', () => {
    socketDevice.setBroadcast(true);
    console.log(`server listening ${socketDevice.address().address}:${socketDevice.address().port}`);
});
socketDevice.bind({
    port: 1883,
});

const fullDeviceInfo = infoDevice.getDevice(shortDeviceInfo);
console.log(fullDeviceInfo);
