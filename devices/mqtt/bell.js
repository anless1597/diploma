const mqtt = require('mqtt');
const dgram = require('dgram');
const socketDevice = dgram.createSocket("udp4");
const infoDevice = require("../infoDevice");
const shortDeviceInfo = {
    name: "Звонок MQTT",
    transport: "MQTT",
    type: "Actuator",
    macAddress: "mac:mqtt:bell001",
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

    const client = mqtt.connect(message.brokerAddress);
    client.on('connect', () => {
        console.log("The Device connected successfully!")
        client.subscribe(message.topicCommands);
    })
    client.on('message', (topic, message) => {
        const res = JSON.parse(message).command === "ring" ? true : false;
        if (res)   console.log('\x1b[32m%s\x1b[0m', "State has changed! The bell is ringing!");
    });
});
socketDevice.on('listening', () => {
    socketDevice.setBroadcast(true);
    console.log(`server listening ${socketDevice.address().address}:${socketDevice.address().port}`);
});
socketDevice.bind({
    port: 1883,
});