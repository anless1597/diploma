const dgram = require('dgram');
const socketDevice = dgram.createSocket("udp4");
const express = require("express");
const infoDevice = require("../infoDevice");

const shortDeviceInfo = {
    name: "Звонок HTTP",
    transport: "HTTP",
    type: "Actuator",
    macAddress: "mac:http:bell001",
};
const fullDeviceInfo = infoDevice.getDevice(shortDeviceInfo);
const {actuatorSettings, deviceRoute} = fullDeviceInfo;
console.log(fullDeviceInfo);

socketDevice.on('message', (message, serverInfo) => {
    message = JSON.parse(message);
    if (fullDeviceInfo.macAddress !== message.deviceId) {
        return;
    }
    console.log(message);
    socketDevice.send(JSON.stringify(actuatorSettings), serverInfo.port, serverInfo.address, (err) => {
        socketDevice.close();
    });

    const app = express();
    app.post(deviceRoute, express.json(), function(request, response){
        const res = request.body.command === "ring" ? true : false;
        if (res)   console.log('\x1b[32m%s\x1b[0m', "State has changed! The bell is ringing!");
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