module.exports = (body) => {
    const {entityName, name = "", dynamicAttributes = [], commands = [], relationships = []} = body;
    let device = {};
    if (name) {
        device["name"] = {
            type:"text",
            value: name,
        };
    }
    device["_id"] = entityName;
    for (const attribute of dynamicAttributes) {
        device[attribute.name] = {
            type: attribute.type,
            value: "",
        };
    }
    for (const command of commands) {
        device[command.name] = {
            type: "command",
            value: "",
        };
    }
    for (const relation of relationships) {
        const refBrokerId = relation.value;
        const propertyName = relation.name;
        device[propertyName] = {};
        device[propertyName]["type"] = "relationship";
        device[propertyName]["value"] = refBrokerId;
    }
    return device;
}