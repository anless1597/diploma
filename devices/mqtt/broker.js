const mosca = require('mosca');
const createDevice = require('../infoDevice');
const shortBrokerInfo = {
    name: "Брокер MQTT",
};
const fullBrokerInfo = createDevice.getBroker(shortBrokerInfo);
const broker = new mosca.Server(fullBrokerInfo.settings);
console.log(fullBrokerInfo);
broker.on('ready', () => {
    console.log('Broker is ready!')
})
broker.on('published', (packet, client) => {
    console.log(`${packet.topic} -m ${packet.payload}`);
})