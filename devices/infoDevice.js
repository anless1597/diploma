require('dotenv').config();
const getMqttActuatorTopic = (macId) => `/${macId}/commands`;
const getHttpActuatorSettings = (name) => {
    let port = 3001;
    if (name === "Лампа HTTP"){
        port = +process.env.HTTP_LAMP_PORT;
    }
    if (name === "Дверь HTTP"){
        port = +process.env.HTTP_DOOR_PORT;
    }
    if (name === "Звонок HTTP"){
        port = +process.env.HTTP_BELL_PORT;
    }
    return {
        host: process.env.LOCALHOST,
        port: port
    }
};
module.exports.getIotAgentEndpoint = (hostAddress, macId) => {
    return `http://${hostAddress}${process.env.IOT_AGENT_HOST_ROUTE}?deviceId=${macId}`;
};
const getHttpActuatorEndpoint = (macId, name) => {
    const {host, port} = getHttpActuatorSettings(name);
    return `http://${host}:${port}/${macId}/commands`;
};
const getHttpActuatorRoute = (macId) => {
    return `/${macId}/commands`;
};
module.exports.getDevice = (device) => {
    const {transport, type, macAddress, name, functionForDataGenerate} = device;
    let obj = {};
    obj["name"] = name;
    obj["type"] = type;
    obj["macAddress"] = macAddress;
    if (transport === "HTTP") {
        if (type === "Sensor") {
            // obj["iotAgentSetting"] = getIoTAgentNorthSettings(macAddress);
            // obj["iotAgentEndpoint"] = module.exports.getIotAgentEndpoint(macAddress);
        }
        if (type === "Actuator") {
            obj["actuatorSettings"] = getHttpActuatorSettings(name);
            obj["deviceRoute"] = getHttpActuatorRoute(macAddress);
            obj["deviceEndPoint"] = getHttpActuatorEndpoint(macAddress, name);
        }
        if (type === "Gate") {
            obj["actuatorSettings"] = getHttpActuatorSettings(name);
            obj["deviceRoute"] = getHttpActuatorRoute(macAddress);
            obj["deviceEndPoint"] = getHttpActuatorEndpoint(macAddress, name);
        }
    }
    if (functionForDataGenerate) obj["functionForDataGenerate"] = functionForDataGenerate;
    return obj;
}
module.exports.getBroker = (brokerInfo) => {
    return {
        name: brokerInfo.name,
    }
};
