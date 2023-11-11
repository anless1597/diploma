const express = require("express");
const cors = require('cors')
const appSouth = express();
const appNorth = express();
const jsonParser = express.json();
const expressValidator = require('express-validator');
const mqtt = require('mqtt');
global.mqttBrokerAddress = process.argv[2] || "localhost";
const mqttClient = mqtt.connect(`mqtt://${mqttBrokerAddress}:1883`);
const deviceController = require('./controllers/userApplication/deviceController');
const httpController = require('./controllers/iotClients/httpClients/httpController');
const mqttController = require('./controllers/iotClients/mqttClients/mqttController');
const brokerController = require('./controllers/broker/brokerController');
const mongoose = require("mongoose");


appSouth.use(jsonParser);
appSouth.use(cors());
appSouth.use(expressValidator());
appSouth.get("/devices", deviceController.index);
appSouth.post("/devices", deviceController.validate('addDevice'), deviceController.addDevice(mqttClient));
appSouth.post("/devices/model", deviceController.validate('addDeviceByModel'), deviceController.addDeviceByModel(mqttClient));
appSouth.delete("/devices/:deviceId", deviceController.validate('deleteDevice'), deviceController.deleteDevice(mqttClient));
appSouth.post("/update", brokerController.updateState(mqttClient));
appSouth.listen(4041);


appNorth.use(jsonParser);
appNorth.post("/iot", httpController.matchFromDevicesAndSendDataToDB);
appNorth.listen(7896);

mqttClient.on('message', mqttController.matchFromDevicesAndSendDataToDB);

mongoose.connect("mongodb://localhost:27017/things", { useUnifiedTopology: true });