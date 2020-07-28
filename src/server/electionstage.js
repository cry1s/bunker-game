const Constants = require('../shared/constants');
const Elections = require('./vote');
const { result } = require('lodash');

class ElectionStage {
    constructor(players, sockets, needToKick) {
        this.finished = false;
        this.players = players;
        this.sockets = sockets;
        this.notKickedPlayers = [];
        this.notKickedSockets = [];
        this.election = new Elections(players);
        for (let playerID in sockets) {
            if (!players[playerID].kicked) {
                this.notKickedSockets.push(sockets[playerID]);
                this.notKickedPlayers.push(sockets[playerID]);
            }
        }
        this.kicked = 0;
        this.changingVotes = false;
        this.losers = null;
        this.lastLosers = [];
        this.needToKick = needToKick;
        this.amountOfPlayers = this.notKickedSockets.length;
        this.currentPlayerNumber = 0;
        this.sendVoteStarted()
    }

    sendVoteStarted() {
        const socket = this.notKickedPlayers[this.currentPlayerNumber];
        if (!this.changingVotes) {
            socket.emit(Constants.MSG_TYPES.PLAYER_VOTE_STARTED);
        } else {
            socket.emit(Constants.MSG_TYPES.CHANGE_VOTE_STARTED);
        }
    }

    onVote(enemyID) {
        const voterID = this.notKickedPlayers[this.currentPlayerNumber].socketId;
        this.election.vote(voterID, enemyID);
        this.currentPlayerNumber++;
        if (this.currentPlayerNumber >= this.amountOfPlayers) {
            this.election.determineLosers();
            this.losers = this.election.losersID;
            if (!this.changingVotes) {
                this.lastLosers = this.losers.slice(); // copy
                Object.keys(this.players).forEach(socketId => {
                    this.sockets[socketId].emit(Constants.MSG_TYPES.DIALOG_MESSAGE, "Результат:<br />\n" + this.election.toString() + "<br />\nЧерез 10 секунд будет выдано по 60 секунд на оправдание");
                });
                setTimeout(this.startJustification, 10000, this.players[this.losers.shift()].username);
            } else {
                if (ElectionStage.equals(this.losers, this.lastLosers)) {
                    if (this.losers.length == 1) {
                        this.kick(this.losers[0]);
                    } else {
                        this.kickOneMoreNextRound();
                    }
                } else if (ElectionStage.contains(this.losers, this.lastLosers)) {
                    if (this.losers.length == 1) {
                        this.kick(this.losers[0]);
                    } else {
                        this.startJustification(this.players[this.losers.shift()].username)
                    }
                } else {
                    this.losers.forEach(loser => {
                        if (!this.lastLosers.includes(loser)) this.lastLosers.push(loser);
                    });
                    this.startJustification(this.players[this.losers.shift()].username)
                }
            }
        }
    }

    startJustification(username) {
        Object.keys(this.players).forEach(socketId => {
            this.sockets[socketId].emit(Constants.MSG_TYPES.JUSTIFICATION_STARTED, username);
        });
        setTimeout(this.endJustification, 60000);
    }

    endJustification() {
        if (this.losers.length == 0) {
            this.currentPlayerNumber = 0;
            this.changingVotes = true;
            this.sendVoteStarted();
        } else {
            this.startJustification(this.players[this.losers.shift()].username)
        }
    }
    
    kick(loserID) {
        Object.keys(this.players).forEach(socketId => {
            this.sockets[socketId].emit(Constants.MSG_TYPES.DIALOG_MESSAGE, `Игрок ${this.players[loserID]} был изгнан!`);
        });
        this.players[loserID].kicked = true;
        this.kicked++;
        this.needToKick--;
        if (this.needToKick <= 0) this.finished = true;
        else this.resetThis();
    }

    resetThis() {
        this.finished = false;
        this.notKickedPlayers = [];
        this.notKickedSockets = [];
        this.election = new Elections(this.players);
        for (let playerID in this.sockets) {
            if (!this.players[playerID].kicked) {
                this.notKickedSockets.push(this.sockets[playerID]);
                this.notKickedPlayers.push(this.sockets[playerID]);
            }
        }
        this.changingVotes = false;
        this.losers = null;
        this.lastLosers = [];
        this.amountOfPlayers = this.notKickedSockets.length;
        this.currentPlayerNumber = 0;
        this.sendVoteStarted();
    }

    kickOneMoreNextRound() {
        Object.keys(this.players).forEach(socketId => {
            this.sockets[socketId].emit(Constants.MSG_TYPES.DIALOG_MESSAGE, `В этом раунде никто не был изгнан. Будет необходимо выгнать на одного больше в следующем раунде.`);
        });
        this.finished = true;
    }

    static equals(arr1, arr2) {
        result = arr1.length == arr2.length;
        if (result) {
            arr1.forEach(el => {
                if (!arr2.includes(el)) result = false;
            });
        }
        return Boolean(result);
    }

    static contains(smalerArr, biggerArr) {
        result = true;
        smalerArr.forEach(el => {
            if (!biggerArr.includes(el)) result = false;
        });
        return result;
    }

    getResult() {
        return this.kicked;
    }
}

module.exports = ElectionStage