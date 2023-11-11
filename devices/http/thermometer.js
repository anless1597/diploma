const random = require('random');
const dgram = require('dgram');
const infoDevice = require("../infoDevice");
const thermometerFunctions = require("../thermometerFunctions");
const axios = require('axios').default;
const ms = thermometerFunctions.getMs();
const shortDeviceInfo = {
    name: "Датчик движения HTTP",
    transport: "HTTP",
    type: "Sensor",
    macAddress: "mac:http:thermometer001",
    functionForDataGenerate: {
        type: 'interval',
        ms: ms,
        attributes: {
            t: "15-17",
            h: "40-50",
        },
    }
};
const fullDeviceInfo = infoDevice.getDevice(shortDeviceInfo);
console.log(fullDeviceInfo);

const socketDevice = dgram.createSocket("udp4");
socketDevice.on('message', (message, serverInfo) => {
    message = JSON.parse(message);
    if (fullDeviceInfo.macAddress !== message.deviceId) {
        return;
    }
    const iotAgentEndpoint = message.serverAddress;

    console.log(`iotAgentEndpoint: ${iotAgentEndpoint}\n`);
    socketDevice.send("Ok", serverInfo.port, serverInfo.address, (err) => {
        socketDevice.close();
    });
    setInterval(() => {
        const newData = thermometerFunctions.getMessage();
        console.log(newData);
        axios.post(iotAgentEndpoint, newData)
            .catch(err => {
                console.log(err.response.status);
                console.log(err.response.data);
            })
    }, ms);
});
socketDevice.on('listening', () => {
    socketDevice.setBroadcast(true);
    console.log(`\nserver listening ${socketDevice.address().address}:${socketDevice.address().port}`);
});
socketDevice.bind({
    port: 80,
});





