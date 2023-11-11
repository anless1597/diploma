import * as elements from "../elementsForPopup.js";
import * as popupFunctions from "../popupFunctions.js";
import {makeCommandHandlersForAllDevices, socketIndication, socketScript} from "../indexAndRoomCommon.js";
import * as handlers from "./handlersForMakingPopup.js";
import {handleCreateDevicePopup, handleCreateRoomPopup} from "./handlersForMakingPopup.js";
import {handleCreateDevice, handleCreateRoom} from "./handlersForRequestsInsidePopup.js";
import {makeRequest} from "./makeRequest.js";
import {handleFilteringDevices} from "./handlerForSelect.js";

makeCommandHandlersForAllDevices();

const buttonCreateDevicePopup = document.getElementById("createPopupDevice");
const buttonCreateRoomPopup = document.getElementById("createPopupRoom");
const popupCloseIcon = document.getElementById("close-popup");
const selectDeviceFilter = document.getElementById("deviceFilter");

popupCloseIcon.addEventListener("click", (e) => {
    popupFunctions.closePopup(e)
});
buttonCreateDevicePopup.addEventListener("click", handleCreateDevicePopup);
buttonCreateRoomPopup.addEventListener("click", handleCreateRoomPopup);
selectDeviceFilter.addEventListener('change', handleFilteringDevices);

document.addEventListener("click", async (e) => {
    if (!e.target) return;
    const idElement = e.target.id;
    if (idElement === "createRoom") handleCreateRoom(e);
    if (idElement === "createDevice") handleCreateDevice(e);
});


const rooms = document.getElementsByClassName("room");
for (const room of rooms) {
    room.onclick = () => {
        location.href = `/rooms/${room.id}`;
    }
    const buttonDeleteRoom = room.getElementsByClassName("room__button-delete")[0];
    buttonDeleteRoom.onclick = async (event) => {
        event.stopPropagation();
        await makeRequest(`http://localhost:80/rooms/${room.id}`, "DELETE");
        location.reload();
    }
}
const devices = document.getElementsByClassName("device");
for (const device of devices) {
    const buttonDeleteDevice = device.getElementsByClassName("device__button-delete")[0];
    buttonDeleteDevice.onclick = async () => {
        console.log(`http://localhost:80/devices/${device.id}`);
        await makeRequest(`http://localhost:80/devices/${device.id}`, "DELETE");
        location.reload();
    }
}


const socket = io();
socket.on("indication", (message) => socketIndication(message));
socket.on("scripts", (message) => socketScript(message));
