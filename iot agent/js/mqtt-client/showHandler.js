const showDataFromMqttClient = function (topic, message) {
    message = message.toString()
    console.log(topic + " " + message);
};
module.exports = showDataFromMqttClient;