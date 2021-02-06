// Learn more about this file at
// https://victorzhou.com/blog/build-an-io-game-part-1/#3-client-entrypoints
import { connect, joinRoom, createRoom } from './networking';
import { downloadAssets } from './assets';

// I'm using a tiny subset of Bootstrap here for convenience - there's some wasted CSS,
// but not much. In general, you should be careful using Bootstrap because it makes it
// easy to unnecessarily bloat your site.
import './css/bootstrap-reboot.css';
import './css/main.css';

const playMenu = document.getElementById('play-menu');
const roomMenu = document.getElementById('room-menu');
const joinRoomButton = document.getElementById('join-room-button');
const createRoomButton = document.getElementById('create-room-button');
const usernameInput = document.getElementById('username-input');
const roomCodeInput = document.getElementById('room-code-input');

Promise.all([
  connect(onGameOver),
  downloadAssets(),
]).then(() => {
  playMenu.classList.remove('hidden');
  usernameInput.focus();
  createRoomButton.onclick = () => {
    createRoom(usernameInput.value);
    playMenu.classList.add('hidden');
    roomMenu.classList.remove('hidden');
  };
  joinRoomButton.onclick = () => {
    let roomCode = (roomCodeInput.value.startsWith("№") ? roomCodeInput.value.slice(1) : roomCodeInput.value)
    joinRoom(usernameInput.value, roomCode);
    playMenu.classList.add('hidden');
    roomMenu.classList.remove('hidden');
  };
  
}).catch(console.error);

function onGameOver() {
  playMenu.classList.remove('hidden');
}
