const Constants = require('../shared/constants');
const Player = require('./player');
const OpenChacsStage = require('./openchacsstage');
const e = require('express');

class Room {
  static catastrofa = {};
  static cards = {};

  constructor(code) {
    this.code = code;
    this.sockets = {};
    this.players = {};
    this.amountPlayers = 0;
    this.amountPlayersToEnd = 0;
    this.terms = "";
    this.deck = JSON.parse(JSON.stringify(Room.cards));

    this.needToKick = 1;
    this.state = Constants.ROOM_STATES.LOBBY; 
    this.gameState = null;
    this.openChacStage = null;
    this.shouldSendUpdate = true;
    this.cicles = 1;
    setInterval(this.update.bind(this), 1000 / 60);
  }

  generateTerms() {
    let randomInt = function(min, max) {
      // получить случайное число от (min-0.5) до (max+0.5)
      let rand = min - 0.5 + Math.random() * (max - min + 1);
      return Math.round(rand);
    }
    let randomArray = function(arr, len) {
      arr.sort(() => Math.random() - 0.5);
      arr.length = len;
      return arr;
    }
    let r = randomInt(0, Room.catastrofa.cataclysmes.length-1);
    this.terms += Room.catastrofa.cataclysmes[r];
    r = randomInt(0, Room.catastrofa.probability.length-1);
    this.terms += " Вероятность найти других выживших людей " + Room.catastrofa.probability[r];
    r = randomInt(0, Room.catastrofa.destruction.length-1);
    this.terms += " Разрушенность поверхности " + Room.catastrofa.destruction[r];

    this.terms += "<br \><br \>Информация о бункере:<br \>";
    this.amountPlayersToEnd = Math.floor(this.amountPlayers / 2);
    this.terms += "Вместимость бункера - " + this.amountPlayersToEnd +"<br \>";
    r = randomInt(0, Room.catastrofa.bunkerSize.length-1);
    this.terms += "Площадь бункера - " + Room.catastrofa.bunkerSize[r] + "м2<br \>"
    r = randomInt(0, Room.catastrofa.timeToLeave.length-1);
    this.terms += "Время пребывания - " + Room.catastrofa.timeToLeave[r] + "<br \>";
    let rooms = randomArray(Room.catastrofa.specRooms, randomInt(0,3));
    rooms.forEach(room => {
      this.terms += room + "<br \>";
    });
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;
    this.players[socket.id] = new Player(socket.id, username, this.deck);
    this.amountPlayers++;
    this.sendUpdateForAll(Constants.MSG_TYPES.LOBBY_UPDATE, this.createLobbyUpdate());
  }

  removePlayer(socket) {
    if (this.state == Constants.ROOM_STATES.LOBBY) {
      delete this.sockets[socket.id];
      delete this.players[socket.id];
      this.amountPlayers--;
      this.sendUpdateForAll(Constants.MSG_TYPES.LOBBY_UPDATE, this.createLobbyUpdate());
    }
  }

  playerSwitchReady(socket) {
    this.players[socket.id].switchReady();
    this.sendUpdateForAll(Constants.MSG_TYPES.LOBBY_UPDATE, this.createLobbyUpdate());
  }

  update() {
    switch (this.state) {
      case Constants.ROOM_STATES.LOBBY:
        if (this.isAllPlayersReady() && (Object.keys(this.players).length >= 5)) {
          this.generateTerms();
          this.sendUpdateForAll(Constants.MSG_TYPES.INIT_GAME_UPDATE, this.createInitUpdate());
          this.sendUpdateForAll(Constants.MSG_TYPES.TERMS_UPDATE, this.terms);
          this.gameState = Constants.GAME_STATES.OPENING_CHACS;
          console.log(`Комната ${this.code} начинает игру`);
          this.state = Constants.ROOM_STATES.GAME;
        }
        break;
      case Constants.ROOM_STATES.GAME:
        if (this.shouldSendUpdate) {
          Object.keys(this.players).forEach(playerID => {
            this.sockets[playerID].emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(playerID));
          });
          this.shouldSendUpdate = false;
        }
        if (this.gameState == Constants.GAME_STATES.OPENING_CHACS && this.openChacStage == null) {
          this.openChacStage = new OpenChacsStage(this.players, this.sockets, this.cicles == 1);
        }
        break;
    }
  }

  openChacRoom(socket, chac) {
    if (this.openChacStage && this.gameState == Constants.GAME_STATES.OPENING_CHACS) {
      const player = this.players[socket.id];
      console.log(`Открываю характеристику ${chac} у ${socket.id}`)
      player.openCard(chac);
      this.openChacStage.onChacOpen();
      this.shouldSendUpdate = true;
    }
  }

  isAllPlayersReady() {
    for (let key in this.players) {
      if (this.players[key].ready == false) return false;
    };
    return true;
  }

  sendUpdateForAll(msg, ...args) {
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      socket.emit(msg, ...args);
    })
  }

  createUpdate(forPlayerID) {
    const update = {
      cicle: this.cicles,
    };
    const keys = Object.keys(this.players);
    for (let nPlayer = 0; nPlayer < keys.length; nPlayer++) {
      const curPlayerID = keys[nPlayer];
      const curPlayer = this.players[curPlayerID];
      const isOwner = curPlayerID == forPlayerID
      update[nPlayer + 1] = {
        me: isOwner,
        kicked: curPlayer.kicked,
        username: curPlayer.username,
        job: this.getChac("job", curPlayer, isOwner),
        health: this.getChac("health", curPlayer, isOwner),
        bio: this.getChac("bio", curPlayer, isOwner),
        hobby: this.getChac("hobby", curPlayer, isOwner),
        feel: this.getChac("feel", curPlayer, isOwner),
        fobia: this.getChac("fobia", curPlayer, isOwner),
        info: this.getChac("info", curPlayer, isOwner),
        bag: this.getChac("bag", curPlayer, isOwner),
      };
      if (isOwner) {
        update.speccards = {
          [curPlayer.speccards.id1]: {
            used: curPlayer.speccards.used1,
            text: curPlayer.speccards.text1,
          },
          [curPlayer.speccards.id2]: {
            used: curPlayer.speccards.used2,
            text: curPlayer.speccards.text2,
          },
        }
      }
    }
    return update;
  }

  createInitUpdate() {
    const update = {};
    update.key = this.code;
    update.amountPlayers = this.amountPlayers;
    const usernames = [];
    Object.keys(this.players).forEach(playerID => {
      usernames.push(this.players[playerID].username);
    });
    update.usernames = usernames;
    return update;
  }

  getChac(chac, player, isOwner) {
    return (isOwner ? player[chac].text :
      player[chac].isOpen ? player[chac].text : "*****")
  }

  createLobbyUpdate() {
    let players = {};
    for (let playerID in this.players) {
      players[this.players[playerID].username] = this.players[playerID].ready;
    };
    return {
      code: this.code,
      players,
    }
  }

  playersIsEmpty() {
    for (let _key in this.players) {
      return false;
    }
    return true;
  }

  static setCards(cardsFromSpreadsheet) {
    Room.cards = cardsFromSpreadsheet;
    console.log("Cards updated");
  }

  static setTerms(termsFromSpreadsheet) {
    Room.catastrofa = termsFromSpreadsheet;
    console.log("Terms updated")
  }
}

module.exports = Room;
