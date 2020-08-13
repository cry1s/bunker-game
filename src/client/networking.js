// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#4-client-networking
import io from 'socket.io-client';
import {
  processGameUpdate,
  initGameUpdate,
  termsUpdate,
  chacOpenProcStart,
  playerVoteStarted,
  changeVoteStarted,
  dialogMessage,
  justificationStarted,
  chatUpdate,
  speccardChooseProc,
  speccardUpdate,
  gameEnd,
} from './gamestate';
import {
  lobbyUpdate
} from './lobbystate';

const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, {
  reconnection: true
});
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

export const connect = onGameOver => (
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.LOBBY_UPDATE, lobbyUpdate);
    socket.on(Constants.MSG_TYPES.INIT_GAME_UPDATE, initGameUpdate);
    socket.on(Constants.MSG_TYPES.TERMS_UPDATE, termsUpdate);
    socket.on(Constants.MSG_TYPES.CHAT_UPDATE, chatUpdate);
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.CHAC_OPEN_PROCESS_STARTED, chacOpenProcStart);
    socket.on(Constants.MSG_TYPES.PLAYER_VOTE_STARTED, playerVoteStarted);
    socket.on(Constants.MSG_TYPES.CHANGE_VOTE_STARTED, changeVoteStarted);
    socket.on(Constants.MSG_TYPES.DIALOG_MESSAGE, dialogMessage);
    socket.on(Constants.MSG_TYPES.JUSTIFICATION_STARTED, justificationStarted);
    socket.on(Constants.MSG_TYPES.SPECCARD_CHOOSE_PROC, speccardChooseProc);
    socket.on(Constants.MSG_TYPES.SPECCARD_UPDATE, speccardUpdate)
    socket.on(Constants.MSG_TYPES.GAME_END, gameEnd)
    socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      document.getElementById('disconnect-modal').classList.remove('hidden');
      document.getElementById('reconnect-button').onclick = () => {
        window.location.reload();
      };
    });
  })
);

export const joinRoom = (username, room_code) => {
  socket.emit(Constants.MSG_TYPES.JOIN_ROOM, username, room_code);
};

export const createRoom = (username) => {
  socket.emit(Constants.MSG_TYPES.CREATE_ROOM, username);
};

export const leaveRoom = (key) => {
  socket.emit(Constants.MSG_TYPES.LEAVE_ROOM, key);
};

export const switchReady = (key) => {
  socket.emit(Constants.MSG_TYPES.PLAYER_READY, key);
}

export const useSpeccard = (key, id) => {
  socket.emit(Constants.MSG_TYPES.USE_SPECCARD, key, id);
}

export const sendMsg = (key, msg) => {
  socket.emit(Constants.MSG_TYPES.SEND_CHAT_MESSAGE, key, msg);
}

export const openChac = (key, chac) => {
  socket.emit(Constants.MSG_TYPES.OPEN_CHAC, key, chac);
}

export const voteSock = (key, n) => {
  socket.emit(Constants.MSG_TYPES.PLAYER_VOTE, key, n);
}

export const chooseSock = (key, n) => {
  socket.emit(Constants.MSG_TYPES.SPECCARD_CHOOSE_DONE, key, n);
}