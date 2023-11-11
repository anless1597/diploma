exports.getAttributes = (model) => models[model.toLowerCase()];
exports.include = (model) => model.toLowerCase() in models;
//заготовленные модели устройств
const models = {
    sthm: {
        "entityType": "Thermometer",
        "transport": "MQTT",
        "dynamicAttributes": [
            {
                "type": "number",
                "objectId": "h",
                "name": "humidity"
            },
            {
                "type": "number",
                "objectId": "t",
                "name": "temperature"
            },
        ],
    },
    sthh: {
        "entityType": "Thermometer",
        "transport": "HTTP",
        "dynamicAttributes": [
            {
                "type": "number",
                "objectId": "h",
                "name": "humidity"
            },
            {
                "type": "number",
                "objectId": "t",
                "name": "temperature"
            },
        ],
    },
    smtm: {
        "entityType": "Motion",
        "transport": "MQTT",
        "dynamicAttributes": [
            {
                "type": "number",
                "objectId": "c",
                "name": "count"
            },
        ]
    },
    smth: {
        "entityType": "Motion",
        "transport": "HTTP",
        "dynamicAttributes": [
            {
                "type": "number",
                "objectId": "c",
                "name": "count"
            },
        ]
    },
    sbellm: {
        "entityType": "Bell",
        "transport": "MQTT",
        "commands": [
            {
                "type": "command",
                "name": "ring",
            },
        ],
    },
    sbellh: {
        "entityType": "Bell",
        "transport": "HTTP",
        "commands": [
            {
                "type": "command",
                "name": "ring",
            },
        ],
    },
    slampm: {
        "entityType": "Lamp",
        "transport": "MQTT",
        "commands": [
            {
                "type": "command",
                "name": "on",
            },
            {
                "type": "command",
                "name": "off",
            },
        ],
        "dynamicAttributes": [
            {
                "type": "text",
                "objectId": "st",
                "name": "status"
            }
        ],
    },
    slamph: {
        "entityType": "Lamp",
        "transport": "HTTP",
        "commands": [
            {
                "type": "command",
                "name": "on",
            },
            {
                "type": "command",
                "name": "off",
            },
        ],
        "dynamicAttributes": [
            {
                "type": "text",
                "objectId": "st",
                "name": "status"
            }
        ],
    },
    sdoorm: {
        "entityType": "Door",
        "transport": "MQTT",
        "commands": [
            {
                "type": "command",
                "name": "open",
            },
            {
                "type": "command",
                "name": "close",
            },
            {
                "type": "command",
                "name": "lock",
            },
            {
                "type": "command",
                "name": "unlock",
            },
        ],
        "dynamicAttributes": [
            {
                "type": "text",
                "objectId": "st",
                "name": "status"
            }
        ],
    },
    sdoorh: {
        "entityType": "Door",
        "transport": "HTTP",
        "commands": [
            {
                "type": "command",
                "name": "open",
            },
            {
                "type": "command",
                "name": "close",
            },
            {
                "type": "command",
                "name": "lock",
            },
            {
                "type": "command",
                "name": "unlock",
            },
        ],
        "dynamicAttributes": [
            {
                "type": "text",
                "objectId": "st",
                "name": "status"
            }
        ],
    },
};
