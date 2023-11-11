import * as elements from "../elementsForPopup.js";
import * as popupFunctions from "../popupFunctions.js";

const responseForModels = await fetch("http://localhost:80/models");
const models = await responseForModels.json();

export async function handleCreateDevicePopup(e) {
    const popupContent = popupFunctions.openPopup();
    popupContent.append(elements.createFormTitle("Создать устройство"));
    popupContent.append(elements.createInput("Название", "", {id: "deviceName"}));
    popupContent.append(elements.createInput("MAC-адрес", "", {id: "macAddress"}));
    const modelsInSelect = models.map(item => ({value: item.name, text: item.name}));
    const selectWithModels = elements.createSelect(
        "Выберете модель",
        modelsInSelect,
        {id: "deviceModel"}
    )
    popupContent.append(selectWithModels);
    popupContent.append(elements.createFormButton("Создать", {id: "createDevice"}));
}

export async function handleCreateRoomPopup(e) {
    const popupContent = popupFunctions.openPopup();
    popupContent.append(elements.createFormTitle("Создать комнату"));
    popupContent.append(elements.createInput("Название", "", {id: "roomName"}));
    popupContent.append(elements.createFormButton("Создать", {id: "createRoom"}));
}