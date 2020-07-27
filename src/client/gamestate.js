// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state

import { create } from "lodash";
import { useSpeccard } from "./networking";

// The "current" state will always be RENDER_DELAY ms behind server time.
// This makes gameplay smoother and lag less noticeable.
const RENDER_DELAY = 100;

const playMenu = document.getElementById('play-menu');
const roomMenu = document.getElementById('room-menu');
const gameContainer = document.getElementById("game");
const gamePlayerCards = document.getElementById("game-player-cards");
const gameTerms = document.getElementById("game-terms");

const gameUpdates = [];
let me = null;
let cicle = 0;
let key = "";
let amountPlayers = 0;

export function initGameUpdate(update) {
  console.log(update);
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
      Профессия: *****
      <hr />
      Здоровье: *****
      <hr />
      Биологические характеристики: *****
      <hr />
      Хобби: *****
      <hr />
      Человеческое качество: *****
      <hr />
      Фобия: *****
      <hr />
      Доп. информация: *****
      <hr />
      Багаж: *****</div>
    <button class="hidden" id="player${playerN+1}-vote-button" style="background-color: red;">ГОЛОСОВАТЬ ПРОТИВ</button>
    <h4>#${playerN+1} ${usernames[playerN]}</h4>
    </div>`;
  }
}

export function termsUpdate(terms) {
  gameTerms.innerHTML = '<p style="margin: 3%; font-size: small;">' + terms + '</p>';
}

export function processGameUpdate(update) {
  console.log(update);
  cicle = update.cicle;
  for (let playerN = 0; playerN < amountPlayers; playerN++) {
    const playerKickedText = document.getElementById("player"+(1+playerN)+"-kicked");
    const playerChacs = document.getElementById("player"+(1+playerN)+"-chacs");
    const playerUpdate = update[playerN+1];
    if (playerUpdate.me) {
      me = playerN+1;
    }
    playerChacs.innerHTML = `Профессия: ${playerUpdate.job}
    <hr />
    Здоровье: ${playerUpdate.health}
    <hr />
    Биологические характеристики: ${playerUpdate.bio}
    <hr />
    Хобби: ${playerUpdate.hobby}
    <hr />
    Человеческое качество: ${playerUpdate.feel}
    <hr />
    Фобия: ${playerUpdate.fobia}
    <hr />
    Доп. информация: ${playerUpdate.info}
    <hr />
    Багаж: ${playerUpdate.bag}`
    if (playerUpdate.kicked) {
      playerKickedText.classList.remove("hidden");
    } else {
      playerKickedText.classList.add("hidden");
    }
  }
  let speccardN = 0;
  for (let id in update.speccards) {
    if (!update.speccards[id].used) {
      const button = document.getElementById(`speccard${++speccardN}`);
      button.onclick = () => {
        useSpeccard(id)
      };
      button.innerHTML = update.speccards[id].text;
    }
  }
}