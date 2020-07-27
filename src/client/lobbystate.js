import { leaveRoom, switchReady } from "./networking";

const playMenu = document.getElementById('play-menu');
const roomMenu = document.getElementById('room-menu');
const gameElem = document.getElementById('game');
const roomNumberElem = document.getElementById("room-number");
const roomPlayersElem = document.getElementById("room-players");
const roomLeaveButton = document.getElementById("leave-room-button");
const roomReadyButton = document.getElementById('room-ready-button');

export function lobbyUpdate(update) {
    console.log("БЕРУ ТИПА ", update);
    roomNumberElem.innerHTML = "Бункер №" + update.code;
    let HTMLtextPlayers = "Игроки<br />";
    Object.keys(update.players).forEach(username => {
        let color;
        if (update.players[username]) color = "green";
        else color = "red";
        HTMLtextPlayers += "<font color=\"" + color + "\">" + username + "</font><br />";
    })
    roomPlayersElem.innerHTML = HTMLtextPlayers;
    roomLeaveButton.onclick = () => {
        playMenu.classList.remove('hidden');
        roomMenu.classList.add('hidden');
        gameElem.classList.add('hidden');
        leaveRoom(update.code);
    };
    roomReadyButton.onclick = () => {
        switchReady(update.code);
    }
}