const IoTAgentDevices = new Map();//Структура значимых атрибутов IoT устройств

module.exports = class IoTAgentDevice {
    constructor(body, addressDevice) {
        const {
            deviceId,
            entityName,
            transport: protocol,
            httpActuatorSettings = "",
            dynamicAttributes = [],
            commands = []
        } = body;
        this.key = deviceId;
        this.value = this.getValueForDevices(entityName, protocol, httpActuatorSettings, dynamicAttributes, commands, addressDevice, deviceId);
    }

    static find(deviceId) {
        return IoTAgentDevices.get(deviceId);
    }

    static getBrokerId(deviceId) {
        return this.find(deviceId).entityName;
    }

    static getProtocol(deviceId) {
        return this.find(deviceId).protocol;
    }

    static delete(deviceId) {
        return IoTAgentDevices.delete(deviceId);
    }

    static findDeviceByEntityName(entityName) {
        for (let [key, value] of IoTAgentDevices.entries()) {
            if (value.entityName === entityName)
                return {
                    deviceId: key,
                    commands: value.commands,
                };
        }
        return false;
    }

    static getProtocolByEntityName(entityName) {
        for (let [key, value] of IoTAgentDevices.entries()) {
            if (value.entityName === entityName)
                return value.protocol;
        }
    }

    static getHttpActuatorSettingsByEntityName(entityName) {
        for (let [key, value] of IoTAgentDevices.entries()) {
            if (value.entityName === entityName)
                return value.httpActuatorSettings;
        }
    }

    save() {
        IoTAgentDevices.set(this.key, this.value);
    }

    static getAll() {
        return IoTAgentDevices;
    }

    static getAllShort() {
        const obj = {}
        for (let [key, value] of IoTAgentDevices) {
            obj[key] = value.entityName;
        }
        return obj;
    }


    getValueForDevices(entityName, protocol, httpActuatorSettings, dynamicAttributes, commands, addressDevice, deviceId) {
        let a = {};
        a["entityName"] = entityName;
        a["protocol"] = protocol;
        if (dynamicAttributes.length !== 0) a["attributes"] = this.getAttributes(dynamicAttributes);
        if (commands.length !== 0) a["commands"] = this.getCommands(commands);
        if (httpActuatorSettings !== "" && protocol !== "MQTT") {
            const {route, method} = httpActuatorSettings;
            a["httpActuatorSettings"] = {
                URL: `http://${addressDevice}${route}`,
                method: method,
            }
        }
        return a;
    }

    getCommands(commands) {
        let ourCommands = commands.map(currentValue => (currentValue.name));
        return ourCommands;
    }

    getAttributes(dynamicAttributes) {
        let attributes = dynamicAttributes.reduce((attributes, currentValue) => {
            attributes[currentValue.objectId] = {
                type: currentValue.type,
                name: currentValue.name,
            }
            return attributes;
        }, {});
        return attributes;
    }
}