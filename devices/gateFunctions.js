const {default: axios} = require("axios");
exports.makeDoor = () => {
    return {
        name: "Door",
        state: "close",
        commands: ["open", "close", "lock", "unlock"],
        getState() {
            return this.state;
        },
        setState(command) {
            if (command === this.state) throw new SyntaxError(`The ${this.name} is already ${this.getState().toUpperCase()}!\n`);
            if (this.state === "lock" && command === "open") throw  new Error(`The ${this.name} is ${this.getState().toUpperCase()}, you can't OPEN!\n`);
            if (this.state === "lock" && command === "close") throw  new Error(`The ${this.name} is already ${this.getState().toUpperCase()}!\n`);
            if (command === "unlock") {
                this.state = "close";
                return true;
            }
            this.state = command;
            return true;
        },
        includeCommand: function (command) {
            return this.commands.includes(command)
        },
    }
};

exports.makeLamp = () => {
    return {
        name: "Lamp",
        state: "off",
        commands: ["on", "off"],
        getState() {
            return this.state;
        },
        setState(newState) {
            if (newState === this.state) throw new SyntaxError(`The ${this.name} is already ${this.getState().toUpperCase()}!\n`);
            this.state = newState;
            return true;
        },
        includeCommand: function (command) {
            return this.commands.includes(command)
        },
    }
};

module.exports.validateCommandAndSendNewState = (device, command, protocol, ...attributesForSending) => {
    command = command.toLowerCase();
    protocol = protocol.toLowerCase();
    if (!device.includeCommand(command)) {
        console.log('\x1b[31m%s\x1b[0m', `The ${device.name} doesn't support this command!\n`);
        return;
    }
    try {
        device.setState(command);
        console.log('\x1b[32m%s\x1b[0m', `State has changed! ${device.name} ${device.getState().toUpperCase()}!`);
        if (protocol === "mqtt") {
            const [mqttClient, topicAttributes] = attributesForSending;
            sendMqttMessage(mqttClient, topicAttributes, device);
        }
        if (protocol === "http") {
            const [iotAgentEndpoint] = attributesForSending;
            return sendHttpMessage(iotAgentEndpoint, device);
        }
    }
    catch (error) {
        console.log('\x1b[31m%s\x1b[0m', error.message);
        return false;
    }
}

function sendMqttMessage(mqttClient, topicAttributes, device) {
    const message = getMessage(device);
    console.log(`topic: ${topicAttributes} -m ${JSON.stringify(message)}\n`);
    mqttClient.publish(topicAttributes, JSON.stringify(message));
}

function sendHttpMessage(iotAgentEndpoint, device) {
    const message = getMessage(device);
    const route = `/${iotAgentEndpoint.split("/")[3]}`;
    console.log(`route: ${route} -m ${JSON.stringify(message)}`);
    return axios.post(iotAgentEndpoint, message);
}

function getMessage(device) {
    return {
        st: device.getState(),
    };
}