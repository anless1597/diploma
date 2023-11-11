const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const hbs = require("hbs");
const jsonParser = express.json();
const entities = require("./entities");
const mainController = require("./controllers/mainController");
const roomController = require("./controllers/roomController");
const scriptsController = require("./controllers/scriptsController");
const path = require("path");
const {param} = require("express/lib/router");
const deviceController = require("./controllers/deviceController");

app.use(jsonParser);
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));
hbs.registerPartials(path.join(__dirname, '..', 'frontend', 'views', 'partials'));
app.set('views', path.join(__dirname, '..', 'frontend', 'views'));
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));

app.get("/", mainController.index);
app.get("/devices", deviceController.index);
app.get("/rooms/:roomId", roomController.index);
app.get("/api/rooms/:roomId", roomController.getRoom);
app.post("/api/rooms/:roomId/edit", roomController.editRoom);
app.post("/rooms", roomController.storeRoom);
app.post("/rooms", roomController.storeRoom);
app.delete("/rooms/:roomId", roomController.destroyRoom);
app.get("/rooms/refs/device", roomController.addRef);
app.post("/devices", deviceController.storeDevice);
app.post("/devices/update", deviceController.updateDevice);
app.delete("/devices/:entityName", deviceController.destroyDevice);
app.delete("/devices/refRoom/:entityName", deviceController.deleteRefRoom);
app.get("/scripts", scriptsController.index);
app.post("/scripts", scriptsController.createScript);
app.get("/scripts/create", scriptsController.create);
app.get("/scripts/edit/:scriptId", scriptsController.edit);
app.patch("/scripts/edit/:scriptId", scriptsController.updateScript);
app.delete("/scripts/:scriptId", scriptsController.deleteScript);
app.get("/models", (req, res) => res.json(entities.models));
app.post("/subscription/:typeSubscription", (req, res) => {
    const {typeSubscription} = req.params;
    if (typeSubscription === "indication") {
        delete req.body.idSub;
        const device = req.body;
        const type = device["_id"].split(":")[1];
        const deviceMustBe = entities.typesOfDevices[type];
        for (const attribute of deviceMustBe.attributes) {
            const attrName = attribute.name;
            const attrValueFromBroker = device[attrName].value;
            device[attrName].value = attribute.value(attrValueFromBroker);
            if ("commandsDependsOnAttribute" in attribute) {
                const commandsDependsOnAttribute = attribute.commandsDependsOnAttribute(attrValueFromBroker)
                for (const command of commandsDependsOnAttribute) {
                    const commandName = command.name;
                    const commandRussianName = command.russianName;
                    device[commandName] = {};
                    device[commandName].type = "command";
                    device[commandName].value = commandRussianName;
                }
            }
        }
    }
    io.sockets.emit(typeSubscription,req.body);
    res.status(200).json({answer:"OK"});
});

io.on('connection', (socket) => {
    console.log('someone connected');
});
server.listen(80, () => {
    console.log('listening on *:80');
});
