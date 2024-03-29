// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state

import {
  Dialog
} from "./dialog"
import {
  Chat
} from "./chat";
import {
  useSpeccard,
  openChac,
  voteSock,
  chooseSock,
  endJust
} from "./networking";
const Constants = require('../shared/constants');

const playMenu = document.getElementById('play-menu');
const roomMenu = document.getElementById('room-menu');
const gameContainer = document.getElementById("game");
const gamePlayerCards = document.getElementById("game-player-cards");
const gameTerms = document.getElementById("game-terms");

const kickedPlayers = {};

let chacsOpened = {
  job: false,
  health: false,
  bio: false,
  hobby: false,
  feel: false,
  fobia: false,
  info: false,
  bag: false,
};

let dialog = new Dialog();
let chat = null;
let myUsername = "";
let me = null;
let cicle = 0;
let key = "";
let amountPlayers = 0;
let needToOpenChacs = 0;

export function initGameUpdate(update) {
  console.log(update);
  closeChacs();
  key = update.key;
  amountPlayers = update.amountPlayers;
  createPlayerCards(update.usernames);
  playMenu.classList.add("hidden");
  roomMenu.classList.add("hidden");
  gameContainer.classList.remove("hidden");
}

function createPlayerCards(usernames) {
  gamePlayerCards.innerHTML = "";
  for (let playerN = 0; playerN < amountPlayers; playerN++) {
    gamePlayerCards.innerHTML += `<div id="player${playerN+1}" class="player">
    <h1 class="hidden" id="player${playerN+1}-kicked" style="text-align: center;">ИЗГНАН</h1>
    <div class="chacs" id="player${playerN+1}-chacs">
      <div class="chac" id="job${playerN+1}">Профессия: *****</div>
      <hr />
      <div class="chac" id="health${playerN+1}">Здоровье: *****</div>
      <hr />
      <div class="chac" id="bio${playerN+1}">Биологические характеристики: *****</div>
      <hr />
      <div class="chac" id="hobby${playerN+1}">Хобби: *****</div>
      <hr />
      <div class="chac" id="feel${playerN+1}">Человеческое качество: *****</div>
      <hr />
      <div class="chac" id="fobia${playerN+1}">Фобия: *****</div>
      <hr />
      <div class="chac" id="info${playerN+1}">Доп. информация: *****</div>
      <hr />
      <div class="chac" id="bag${playerN+1}">Багаж: *****</div>
    </div> <hr />
    <button class="hidden" id="player${playerN+1}-vote-button" style="background-color: red; width: 100%">ГОЛОСОВАТЬ ПРОТИВ</button> <hr />
    <button class="hidden" id="player${playerN+1}-choose-button" style="background-color: limegreen; width: 100%">ВЫБРАТЬ</button> <hr />
    <h4>#${playerN+1} ${usernames[playerN]}</h4>
    </div>`;
    document.getElementById(`player${playerN+1}-vote-button`).onclick = (() => voteAgainst(playerN + 1));
  }
}

function closeChacs() {
  for (let chac in chacsOpened) {
    chacsOpened[chac] = false;
  }
}

function voteAgainst(n) {
  for (let i = 0; i < amountPlayers; i++) {
    document.getElementById(`player${i+1}-vote-button`).classList.add("hidden");
  }
  voteSock(key, n);
}

function chooseAPlayer(n) {
  console.log("Отправляю выбор", key, n);
  for (let i = 0; i < amountPlayers; i++) {
    document.getElementById(`player${i+1}-choose-button`).classList.add("hidden");
    if (i+1 == me) continue;
    const chacsE = [
      document.getElementById(`job${i+1}`),
      document.getElementById(`health${i+1}`),
      document.getElementById(`bio${i+1}`),
      document.getElementById(`hobby${i+1}`),
      document.getElementById(`feel${i+1}`),
      document.getElementById(`fobia${i+1}`),
      document.getElementById(`info${i+1}`),
      document.getElementById(`bag${i+1}`),
    ];
    chacsE.forEach(chac => chac.onclick = "");
  }
  chooseSock(key, String(n));
}

function setCfgForChacs() {
  const chacsE = [
    document.getElementById(`job${me}`),
    document.getElementById(`health${me}`),
    document.getElementById(`bio${me}`),
    document.getElementById(`hobby${me}`),
    document.getElementById(`feel${me}`),
    document.getElementById(`fobia${me}`),
    document.getElementById(`info${me}`),
    document.getElementById(`bag${me}`),
  ];
  chacsE.forEach(chacE => {
    const chac = chacE.id.replace(String(me), "");
    chacE.style.textDecoration = chacsOpened[chac] ? (chacE.onclick = "", "underline") : "none";
  })
}

export function termsUpdate(terms) {
  gameTerms.innerHTML = '<p style="margin: 3%; font-size: small;">' + terms + '</p>';
}

export function processGameUpdate(update) {
  console.log(update);
  cicle = update.cicle;
  for (let playerN = 0; playerN < amountPlayers; playerN++) {
    const playerKickedText = document.getElementById("player" + (1 + playerN) + "-kicked");
    const playerChacs = document.getElementById("player" + (1 + playerN) + "-chacs");
    const playerUpdate = update[playerN + 1];
    if (playerUpdate.me) {
      chacsOpened = playerUpdate.chacsOpened;
      myUsername = playerUpdate.username;
      me = playerN + 1;
      setCfgForChacs();
    }
    document.getElementById(`job${playerN+1}`).innerHTML = `Профессия: ${playerUpdate.job}`;
    document.getElementById(`health${playerN+1}`).innerHTML = `Здоровье: ${playerUpdate.health}`;
    document.getElementById(`bio${playerN+1}`).innerHTML = `Биологические характеристики: ${playerUpdate.bio}`;
    document.getElementById(`hobby${playerN+1}`).innerHTML = `Хобби: ${playerUpdate.hobby}`;
    document.getElementById(`feel${playerN+1}`).innerHTML = `Человеческое качество: ${playerUpdate.feel}`;
    document.getElementById(`fobia${playerN+1}`).innerHTML = `Фобия: ${playerUpdate.fobia}`;
    document.getElementById(`info${playerN+1}`).innerHTML = `Доп. информация: ${playerUpdate.info}`;
    document.getElementById(`bag${playerN+1}`).innerHTML = `Багаж: ${playerUpdate.bag}`;
    if (playerUpdate.kicked) {
      kickedPlayers[playerN + 1] = true;
      playerKickedText.classList.remove("hidden");
      playerChacs.classList.add("hidden");
    } else {
      kickedPlayers[playerN + 1] = false;
      playerKickedText.classList.add("hidden");
      playerChacs.classList.remove("hidden");
    }
  }
  speccardUpdate(update.speccards);
  if (!chat) {
    chat = new Chat(key, myUsername);
  }
}

export function chacOpenProcStart(needToOpen) {
  needToOpenChacs = needToOpen;
  if (needToOpenChacs == 3) {
    localOpenChac("job")
  }
  document.getElementById(`health${me}`).onclick = chacsOpened.health ? "" : () => localOpenChac("health");
  document.getElementById(`bio${me}`).onclick = chacsOpened.bio ? "" : () => localOpenChac("bio");
  document.getElementById(`hobby${me}`).onclick = chacsOpened.hobby ? "" : () => localOpenChac("hobby");
  document.getElementById(`feel${me}`).onclick = chacsOpened.feel ? "" : () => localOpenChac("feel");
  document.getElementById(`fobia${me}`).onclick = chacsOpened.fobia ? "" : () => localOpenChac("fobia");
  document.getElementById(`info${me}`).onclick = chacsOpened.info ? "" : () => localOpenChac("info");
  document.getElementById(`bag${me}`).onclick = chacsOpened.bag ? "" : () => localOpenChac("bag");
}

export function chatUpdate(msg) {
  chat.onUpdate(msg);
}

function localOpenChac(chac) {
  chacsOpened[chac] = true;
  document.getElementById(`${chac}${me}`).onclick = "";
  needToOpenChacs--;
  openChac(key, chac);
  if (!needToOpenChacs) {
    chacOpenProcEnd();
  }
}

function chacOpenProcEnd() {
  document.getElementById(`health${me}`).onclick = null;
  document.getElementById(`bio${me}`).onclick = null;
  document.getElementById(`hobby${me}`).onclick = null;
  document.getElementById(`feel${me}`).onclick = null;
  document.getElementById(`fobia${me}`).onclick = null;
  document.getElementById(`info${me}`).onclick = null;
  document.getElementById(`bag${me}`).onclick = null;
}

export function playerVoteStarted() {
  for (let i in kickedPlayers) {
    if (!kickedPlayers[i] && i != me) {
      const button = document.getElementById(`player${i}-vote-button`);
      button.onclick = () => voteAgainst(i);
      button.classList.remove("hidden");
    }
  }
  dialog.showMessage("Ваш черед голосовать");
}

export function changeVoteStarted() {
  for (let i in kickedPlayers) {
    if (!kickedPlayers[i] && i != me) {
      document.getElementById(`player${i}-vote-button`).classList.remove("hidden");
    }
  }
  dialog.showMessage("Измените голос, если хотите");
}

export function dialogMessage(msg) {
  dialog.showMessage(msg);
}

export function justificationStarted(username) {
  dialog.showMessage("Внимание, оправдывается " + username + "!");
  dialog.startJustificationTimer(username == myUsername);
}

export function justificationEnded() {
  dialog.onJustEnded();
}

export function speccardChooseProc(chooseType) {
  switch(chooseType) {
    case Constants.SPECCARD_CHOOSE_TYPE.LIVING_CHACS:
      for (let i = 0; i < amountPlayers; i++) {
        if (i+1 == me) continue;
        const chacsE = [
          document.getElementById(`job${i+1}`),
          document.getElementById(`health${i+1}`),
          document.getElementById(`bio${i+1}`),
          document.getElementById(`hobby${i+1}`),
          document.getElementById(`feel${i+1}`),
          document.getElementById(`fobia${i+1}`),
          document.getElementById(`info${i+1}`),
          document.getElementById(`bag${i+1}`),
        ];
        chacsE.forEach(chac => {
          if ( chac.innerHTML.endsWith("*****") ) {
            chac.onclick = () => chooseAPlayer(chac.id.replace(String(i+1), "")+ (i+1));
          }
        });
      }
      break;
    case Constants.SPECCARD_CHOOSE_TYPE.LIVING_EXCEPT_ME:
      for (let i = 0; i < amountPlayers; i++) {
        if (i+1 == me) continue;
        if (!kickedPlayers[i+1]) {
          document.getElementById(`player${i+1}-choose-button`).onclick = (() => chooseAPlayer(i + 1));
          document.getElementById(`player${i+1}-choose-button`).classList.remove("hidden");
        }
      }
      break;
    case Constants.SPECCARD_CHOOSE_TYPE.KICKED:
      for (let i = 0; i < amountPlayers; i++) {
        if (i+1 == me) continue;
        if (kickedPlayers[i+1]) {
          document.getElementById(`player${i+1}-choose-button`).onclick = (() => chooseAPlayer(i + 1));
          document.getElementById(`player${i+1}-choose-button`).classList.remove("hidden");
        }
      }
      break;
  }
}

export function speccardUpdate(update) {
  console.log(update);
  let speccardN = 0;
  for (let id in update) {
    const button = document.getElementById(`speccard${++speccardN}`);
    button.onclick = () => {
      console.log(key, id);
      // button.classList.add("hidden");
      button.disabled = "disabled";
      useSpeccard(key, id);
    };
    if (update[id].used || kickedPlayers[me]) {
      button.disabled = "disabled";
    } else {
      button.disabled = "";
    }
    button.innerHTML = update[id].text;
  }
}

export function gameEnd(room) {
  console.log(room);
}

export function endJustGameState() {
  endJust(key);
}