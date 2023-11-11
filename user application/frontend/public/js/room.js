import * as elements from "./elementsForPopup.js";
import * as popupFunctions from "./popupFunctions.js";
import {makeRequest} from "./index/makeRequest.js";
import {makeCommandHandlersForAllDevices, socketIndication, socketScript} from "./indexAndRoomCommon.js";

makeCommandHandlersForAllDevices();

const roomId = window.location.pathname.split("/")[2];
const buttonAddDevice = document.getElementById("addDevice");
const popupCloseIcon = document.getElementById("close-popup");
const buttonDeleteRoom = document.getElementById("deleteRoom");
const buttonEditRoom = document.getElementById("editPopupRoom");
buttonDeleteRoom.addEventListener("click", async (e) => {
    await makeRequest(`http://localhost:80/rooms/${roomId}`, "DELETE");
    location.href = '/';
});
buttonEditRoom.addEventListener("click", async (e) => {
    const popupContent = popupFunctions.openPopup();
    const responseForRoom = await fetch(`http://localhost:80/api/rooms/${roomId}`);
    const room = await responseForRoom.json();
    console.log(room);
    popupContent.append(elements.createFormTitle("Редактировать комнату"));
    popupContent.append(elements.createInput("Название", room.roomName.value, {id: "roomName"}));
    popupContent.append(elements.createFormButton("Редактировать", {id: "editRoom"}));
});
popupCloseIcon.addEventListener("click", (e) => {
    popupFunctions.closePopup(e)
});
buttonAddDevice.addEventListener("click", async (e) => {
    const currentPopup = document.getElementById("popup");
    currentPopup.classList.add("open");
    const popupContent = currentPopup.querySelector(".popup__content");
    popupContent.append(elements.createFormTitle("Добавить устройство в комнату"));
    const responseForDevices = await fetch("http://localhost:80/devices");
    const devices = await responseForDevices.json();
    const devicesForSelect = devices.map(device => (
        {
            value: device["_id"],
            text: device["name"].value,
        }));
    popupContent.append(elements.createSelect("Выбрать устройство", devicesForSelect, {id: "deviceInRoom"}));
    popupContent.append(elements.createFormButton("Добавить", {id: "addDeviceInRoom"}));
});

document.addEventListener("click", async (e) => {
    if (!e.target) return;
    const idElement = e.target.id;
    if (idElement === "addDeviceInRoom") {
        const deviceId = document.getElementById("deviceInRoom").value;
        const url = `http://localhost:80/rooms/refs/device?roomId=${roomId}&&deviceId=${deviceId}`;
        await fetch(url);
        popupFunctions.closePopup(e);
        location.reload();
    }
    if (idElement === "editRoom") {
        const roomName = document.getElementById("roomName").value;
        const object = {
            "roomName": {
                type: "text",
                value: roomName,
            }
        };
        await makeRequest(`/api/rooms/${roomId}/edit`, "POST", object);
        location.reload();
    }
});

const devices = document.getElementsByClassName("device");
for (const device of devices) {
    const buttonDeleteDevice = device.getElementsByClassName("device__button-delete")[0];
    buttonDeleteDevice.onclick = async () => {
        console.log(`http://localhost:80/devices/refRoom/${device.id}`);
        await makeRequest(`http://localhost:80/devices/refRoom/${device.id}`, "DELETE");
        location.reload();
    }
}


const socket = io();
socket.on("indication", (message) => socketIndication(message));
socket.on("scripts", (message) => socketScript(message));