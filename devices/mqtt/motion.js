const dgram = require('dgram');
const socketDevice = dgram.createSocket("udp4");
const mqtt = require('mqtt');
const random = require('random');
const infoDevice = require('../infoDevice');
const readline = require("readline");
const shortDeviceInfo = {
    name: "Датчик движения MQTT",
    transport: "MQTT",
    type: "Sensor",
    macAddress: "mac:mqtt:motion001",
    functionForDataGenerate: {
        type: 'readline',
        attributes: {
            с: "0-1"
        },
    }
};

const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const fullDeviceInfo = infoDevice.getDevice(shortDeviceInfo);
console.log(fullDeviceInfo);
let devicePaired = false;
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
    devicePaired = true;
    client.on('connect', () => {
        console.log("The Device connected successfully!");
        loop(client, message.topicAttributes);
    })

});
socketDevice.on('listening', () => {
    socketDevice.setBroadcast(true);
    console.log(`server listening ${socketDevice.address().address}:${socketDevice.address().port}`);
});
socketDevice.bind({
    port: 1883,
});



function loop(client, topic) {
    input.question("Enter command: ", (answer) => {
        answer = answer.toLowerCase();
        console.log(answer);
        if (answer === "comein") {
            if (devicePaired) client.publish(topic, JSON.stringify({c: 1}))
            console.log('\x1b[32m%s\x1b[0m', "The motion sensor detected someone!");
        }
        if (answer === "comeout") {
            if (devicePaired) client.publish(topic, JSON.stringify({c: 0}))
            console.log('\x1b[32m%s\x1b[0m', "No motion sensor detected!");
        }
        loop(client, topic);
    });
};
