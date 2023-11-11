exports.models = [
    {
        name: "SThM",
        requirements: [],
    },
    {
        name: "SThH",
        requirements: [],
    },
    {
        name: "SMtM",
        requirements: [],
    },
    {
        name: "SMtH",
        requirements: [],
    },
    {
        name: "SBellM",
        requirements: [],
    },
    {
        name: "SBellH",
        requirements: ["endpoint"],
    },
    {
        name: "SLampM",
        requirements: [],
    },
    {
        name: "SLampH",
        requirements: ["endpoint"],
    },
    {
        name: "SDoorM",
        requirements: [],
    },
    {
        name: "SDoorH",
        requirements: ["endpoint"],
    },
];

exports.typesOfDevices = {
    "Thermometer": {
        text: "Термометр",
        attributes: [
            {
                name: "humidity",
                russianName: "Влажность",
                value: (item) => item,
            },
            {
                name: "temperature",
                russianName: "Температура",
                value: (item) => item,
            },
        ],
        commands: [],
    },
    "Motion": {
        text: "Датчик движения",
        attributes: [
            {
                name: "count",
                russianName: "Присутствие",
                value: (item) => {
                    if (item === 0) return "Никого нет";
                    if (item === 1) return "Кто-то есть";
                },
            },
        ],
        commands: [],
    },
    "Bell": {
        text: "Звонок",
        attributes: [],
        commands: [
            {
                name: "ring",
                commandsDependsOnAttribute: false,
                russianName: "Позвонить",
            },
        ],
    },
    "Lamp": {
        text: "Лампа",
        attributes: [
            {
                name: "status",
                russianName: "Состояние",
                value: (item) => {
                    if (item === "on") return "Включено";
                    if (item === "off") return "Выключено";
                },
                commandsDependsOnAttribute: (item) => {
                    if (item === "on") {
                        return [
                            {
                                name: "off",
                                russianName: "Выключить",
                            }
                        ]
                    }
                    if (item === "off") {
                        return [
                            {
                                name: "on",
                                russianName: "Включить",
                            }
                        ]
                    }
                }
            },
        ],
        commands: []
    },
    "Door": {
        text: "Дверь",
        attributes: [
            {
                name: "status",
                russianName: "Состояние",
                value: (item) => {
                    if (item === "open") return "Открыто";
                    if (item === "close") return "Закрыто";
                    if (item === "lock") return "Заблокировано";
                },
                commandsDependsOnAttribute: (item) => {
                    if (item === "open") {
                        return [
                            {
                                name: "close",
                                russianName: "Закрыть",
                            },
                            {
                                name: "lock",
                                russianName: "Заблокировать",
                            },
                        ]
                    }
                    if (item === "close") {
                        return [
                            {
                                name: "open",
                                russianName: "Открыть",
                            },
                            {
                                name: "lock",
                                russianName: "Заблокировать",
                            },
                        ]
                    }
                    if (item === "lock") {
                        return [
                            {
                                name: "unlock",
                                russianName: "Разблокировать",
                            },
                        ]
                    }
                }
            },
        ],
        commands: []
    },
}