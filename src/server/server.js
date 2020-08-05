const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');
const { GoogleSpreadsheet } = require('google-spreadsheet')

const Constants = require('../shared/constants');
const Room = require('./room');
const webpackConfig = require('../../webpack.dev.js');

// Get values for players chars
LoadAndSendSpreadsheetData();

// Setup an Express server
const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);
  socket.on(Constants.MSG_TYPES.CREATE_ROOM, createRoom);
  socket.on(Constants.MSG_TYPES.JOIN_ROOM, joinRoom);
  socket.on(Constants.MSG_TYPES.LEAVE_ROOM, leaveRoom);
  socket.on(Constants.MSG_TYPES.PLAYER_READY, switchReady);
  socket.on(Constants.MSG_TYPES.OPEN_CHAC, openChac);
  socket.on(Constants.MSG_TYPES.PLAYER_VOTE, playerVote);
  socket.on(Constants.MSG_TYPES.SEND_CHAT_MESSAGE, sendChatMessage);
  socket.on(Constants.MSG_TYPES.USE_SPECCARD, useSpeccard)
  socket.on('disconnect', onDisconnect);
});



const rooms = {};

function useSpeccard(key, id) {
  if (rooms.hasOwnProperty(key)) {
    rooms[key].speccardManager.onUseSpeccard(this, id);
  }
}

function sendChatMessage(key, msg) {
  rooms[key].sendChatMessage(msg);
}

function switchReady(key) {
  rooms[key].playerSwitchReady(this);
}

function createRoom(username) {
  let key;
  do {
    key = getAlphaNumericRandom(6);
  } while (rooms[key] != undefined)

  rooms[key] = new Room(key);
  console.log("Created room with key "+ key);
  rooms[key].addPlayer(this, username);
}

function joinRoom(username, key) {
  if (rooms[key] != undefined && rooms[key] != rooms.n) {
    rooms[key].addPlayer(this, username);
  }
}

function leaveRoom(key) {
  rooms[key].removePlayer(this);
  if (rooms[key].playersIsEmpty()) {
    deleteRoom(key)
  }
}

function onDisconnect() {
  for (let key in rooms) {
    console.log(key);
    if (this.id in rooms[key].players) {
      rooms[key].removePlayer(this);
      if (rooms[key].playersIsEmpty()) {
        deleteRoom(key)
      }
      break;
    }
  }
  console.log("Player disconnected by random situation or what idk! "+ this.id)
}

function getAlphaNumericRandom(len) {
  if ((len == undefined) || (len <= 0)) {
    len = 1;
  }
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  let iffirst = 0;
  for (let i = 0; i < len; i++) {
    if (i == 0) {
      iffirst = 10;
    } else {
      iffirst = 0;
    }
    result += characters[Math.round(Math.random() * (characters.length - iffirst - 1))];
  }
  return result;
}

async function LoadAndSendSpreadsheetData() {
  let result = {
    "jobs": {},
    "healths": {},
    "hobbies": {},
    "feels": {},
    "fobies": {},
    "infos": {},
    "bags": {},
    "speccards": {},
  }
  let result2 = {
    cataclysmes: [],
    timeToLeave: [],
    probability: [],
    destruction: [],
    bunkerSize: [],
    specRooms: [],
  }
  const doc = new GoogleSpreadsheet(Constants.GOOGLE_SPREADSHEET_ID);
  doc.useServiceAccountAuth(require('./BunkerGame-bcc41d95122e.json'));
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const sheet2 = doc.sheetsByIndex[1];
  await sheet.loadCells();
  await sheet2.loadCells();
  Object.keys(result).forEach(key => {
    let column;
    switch(key) {
      case "jobs":
        column = 0;
        break;
      case "healths":
        column = 1;
        break;
      case "hobbies":
        column = 3;
        break;
      case "feels":
        column = 4;
        break;
      case "fobies":
        column = 5;
        break;
      case "infos":
        column = 6;
        break;
      case "bags":
        column = 7;
        break;
      case "speccards":
        column = 8;
        break;
    }
    for (let row = 1; row < sheet.rowCount; row++) {
      let cellValue = sheet.getCell(row, column).value;
      if (cellValue === null) break;
      result[key][row] = cellValue;
    }
  })
  Object.keys(result2).forEach(key => {
    let column;
    switch(key) {
      case "cataclysmes":
        column = 0;
        break;
      case "timeToLeave":
        column = 1;
        break;
      case "probability":
        column = 2;
        break;
      case "destruction":
        column = 3;
        break;
      case "bunkerSize":
        column = 4;
        break;
      case "specRooms":
        column = 5;
        break;
    }
    for (let row = 1; row < sheet2.rowCount; row++) {
      let cellValue = sheet2.getCell(row, column).value;
      if (cellValue === null) break;
      result2[key].push(cellValue);
    }
  })
  Room.setCards(result);
  Room.setTerms(result2);
}

function deleteRoom(key) {
  delete rooms[key];
  console.log("Room with key "+ key + " deleted!");
}

function openChac(key, chac) {
  const room = rooms[key];
  room.openChacRoom(this, chac);
}

function playerVote(key, voteN) {
  rooms[key].vote(this, voteN-1);
}