import {makeRequest} from "./index/makeRequest.js";

export function makeCommandHandlersForAllDevices() {
    const commands = ["on", "off", "ring", "open", "close", "lock", "unlock"];
    commands.map(command => {
        const buttonsOfCommand = document.getElementsByClassName(command);
        for (const buttonOfCommand of buttonsOfCommand) {
            buttonOfCommand.onclick = makeUpdatingCommand(buttonOfCommand, command);
        }
    })
}

export function socketIndication(message) {
    // console.log(message);
    const device = document.getElementById(message["_id"]);
    if (device.getElementsByClassName("command")) {
        const buttonsCommand = device.getElementsByClassName("command")
        while (buttonsCommand[0]) {
            const buttonCommandWithADiv = buttonsCommand[0].parentNode
            buttonCommandWithADiv.parentNode.removeChild(buttonCommandWithADiv);
        }
    }
    delete message["_id"];
    for (const nameAttributeOrCommand in message) {
        const valueAttributeOrCommand = message[nameAttributeOrCommand];
        if (valueAttributeOrCommand.type === "command") {
            const div = document.createElement('div');
            div.className = "text-center";
            const button = document.createElement('button');
            button.className = `device__button-command ${nameAttributeOrCommand} command w-100 btn btn-sm btn-dark`;
            button.type = `button`;
            button.innerHTML = valueAttributeOrCommand.value;
            const buttonDeleteDevice = device.getElementsByClassName("device__button-delete")[0].parentNode;
            button.onclick = makeUpdatingCommand(button, nameAttributeOrCommand);
            div.append(button);
            console.log(div)
            buttonDeleteDevice.before(div);
        } else {
            const divAttribute = device.getElementsByClassName(nameAttributeOrCommand)[0];
            divAttribute.innerHTML = valueAttributeOrCommand.value;
        }
    }
}

export function socketScript(message) {
    console.log(message);
    Toastify({
        text: `Отработала подписка "${message.nameSub.toUpperCase()}"`,
        duration: 3000,
        className: "text-white text-center ps-5 pe-5 pb-4 pt-4 bg-primary opacity-75 rounded mt-2 fs-5",
        selector: "notificationScript",
    }).showToast();
}

function makeUpdatingCommand(button, command) {
    return async () => {
        const object = {
            id: button.closest(".device").id,
            command: command,
        }
        console.log(object);
        await makeRequest(`http://localhost:80/devices/update`, "POST", object);
        // location.reload();
    }
}
