const { default: axios } = require("axios");
//запросы к платформе
exports.updateCommandInAgent = (object) => {
    return axios({
        method: "post",
        url: "http://localhost:4041/update",
        data: object
    }).then((res) => res.data);
}
exports.postDeviceInAgent = (object) => {
    return axios({
        method: "post",
        url: "http://localhost:4041/devices/model",
        data: object
    }).then((res) => res.data);
}
exports.deleteDeviceInAgent = (entityName) => {
    return axios({
        method: "delete",
        url: `http://localhost:4041/devices/${entityName}`,
    }).then((res) => res.data);
}
exports.postObjectInBroker = (object) => {
    return axios({
        method: "post",
        url: "http://localhost:5500/iot/entities",
        data: object
    }).then((res) => res.data);
}
exports.getAllObjectsByType = (type) => {
    return axios({
        method: "get",
        url: `http://localhost:5500/iot/entities?type=${type}`,
    }).then((res) => res.data);
}
exports.getObjectById = (id) => {
    return axios({
        method: "get",
        url: `http://localhost:5500/iot/entities/${id}`,
    }).then((res) => res.data);
}
exports.getParentObjectById = (id) => {
    return axios({
        method: "get",
        url: `http://localhost:5500/iot/entities?ref=${id}`,
    }).then((res) => res.data);
}
exports.deleteAttributeByObjectId = (id, attr) => {
    console.log(`http://localhost:5500/iot/entities/${id}/attrs/${attr}`);
    return axios({
        method: "delete",
        url: `http://localhost:5500/iot/entities/${id}/attrs/${attr}`,
    }).then((res) => res.data);
}
exports.addAttributeById = (id, attribute) => {
    return axios({
        method: "post",
        url: `http://localhost:5500/iot/entities/${id}/attrs`,
        data: attribute
    }).then((res) => res.data);
}

exports.deleteObjectById = (id) => {
    return axios({
        method: "DELETE",
        url: `http://localhost:5500/iot/entities/${id}`,
    }).then((res) => res.data);
}
exports.getAllDevicesShortFormat = () => {
    return axios({
        method: "get",
        url: `http://localhost:4041/devices?form=short`,
    }).then((res) => res.data);
}
exports.createSubscriptionForDevice = (idPattern, typePattern, attributes, notification) => {
    let subscription = {
        subject: [
            {
                idPattern: idPattern,
                typePattern: typePattern,
                attrs: attributes
            }
        ],
        notification: {
            url: notification
        }
    }

    console.log(subscription);
    return axios({
        method: "post",
        url: `http://localhost:5500/iot/subscriptions`,
        data: subscription
    }).then((res) => res.data);
}

exports.deleteScriptById = (id) => {
    return axios({
        method: "DELETE",
        url: `http://localhost:5500/iot/subscriptions/${id}`,
    }).then((res) => res.data);
}

exports.getAllSubs = () => {
    return axios({
        method: "get",
        url: `http://127.0.0.1:5500/iot/subscriptions`,
    }).then((res) => res.data);
}

exports.createScript = (script) => {
    return axios({
        method: "post",
        url: `http://localhost:5500/iot/subscriptions`,
        data: script
    }).then((res) => res.data);
}


exports.updateScript = (id, script) => {
    return axios({
        method: "patch",
        url: `http://localhost:5500/iot/subscriptions/${id}`,
        data: script
    }).then((res) => res.data);
}
