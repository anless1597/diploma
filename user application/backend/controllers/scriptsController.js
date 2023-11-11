const fetch = require('node-fetch');
const iotPlatform = require("./iotPlatformFunctions");

// Отрисовка страницы со всеми сценариями
exports.index = async function (request, response) {
    const subs = await fetch(`http://127.0.0.1:5500/iot/subscriptions`).then(response => {
        return response.json()
    })
    const scriptsByUser = subs.filter(sub => "description" in sub);
    response.render("scripts.hbs", {
        subs: scriptsByUser
    });
};

// Отрисовка страницы создания сценария
exports.create = function (request, response) {
    response.render("scripts.create.hbs");
};


// Удаление сценария
exports.deleteScript = async function (request, response) {
    try {
        const scriptId = request.params.scriptId;
        const a = await iotPlatform.deleteScriptById(scriptId);
        response.json({answer: "OK"});
    } catch (err) {
        if (err) console.log(err)
    }
}

// Создание сценария
exports.createScript = async function (request, response) {
    try {
        console.log(request.body);
        const script = request.body;
        const a = await iotPlatform.createScript(script);
        response.json({answer: "OK"});
    } catch (err) {
        if (err) console.log(err)
    }
}

// Отрисовка страницы редактирования сценария
exports.edit = async function (request, response) {
    response.render("scripts.edit.hbs");
};

// Обновление сценария
exports.updateScript = async function (request, response) {
    try {
        const scriptId = request.params.scriptId;
        const script = request.body;
        const a = await iotPlatform.updateScript(scriptId, script);
        response.json({answer: "OK"});
    } catch (err) {
        if (err) console.log(err)
    }
} 
