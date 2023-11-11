import { makeRequest } from "./index/makeRequest.js";
import {socketScript} from "./indexAndRoomCommon.js";

// Добавление событий для кнопок редактирования и удаление сценариев
const scripts = document.getElementsByClassName("script");
for (const script of scripts) {
    const buttonEditScript = script.getElementsByClassName("script__button-edit")[0]
    buttonEditScript.onclick = () => {
        location.href = `/scripts/edit/${script.id}`;
    }
    const buttonDeleteScript = script.getElementsByClassName("script__button-delete")[0];
    buttonDeleteScript.onclick = async (event) => {
        event.stopPropagation();
        await makeRequest(`http://localhost:80/scripts/${script.id}`, "DELETE");
        location.reload();
    }
}

const socket = io();
socket.on("scripts", (message) => socketScript(message));
