const Constants = require('../shared/constants');
const Elections = require('./vote');

class ElectionStage {

    constructor(players, sockets, needToKick, room) {
        this.room = room;
        this.finished = false;
        this.players = Object.assign({}, players);
        this.sockets = Object.assign({}, sockets);
        this.notKickedPlayers = [];
        this.notKickedSockets = [];
        this.election = new Elections(players, room);
        for (let playerID in sockets) {
            if (!players[playerID].kicked) {
                this.notKickedSockets.push(sockets[playerID]);
                this.notKickedPlayers.push(sockets[playerID]);
            }
        }
        this.kicked = 0;
        this.timer = null;
        this.changingVotes = false;
        this.losers = null;
        this.lastLosers = [];
        this.needToKick = needToKick;
        this.amountOfPlayers = this.notKickedSockets.length;
        this.currentPlayerNumber = 0;
        this.sendVoteStarted()
    }

    sendVoteStarted() {
        let socket = this.notKickedPlayers[this.currentPlayerNumber];
        if (socket.id == this.room.target19) {
            socket = this.sockets[this.room.hacker19]
        }
        if (!this.changingVotes) {
            socket.emit(Constants.MSG_TYPES.PLAYER_VOTE_STARTED);
        } else {
            socket.emit(Constants.MSG_TYPES.CHANGE_VOTE_STARTED);
        }
    }

    onVote(voterID, enemyID) {
        console.log(voterID, enemyID);
        this.election.vote(voterID, enemyID);
        this.currentPlayerNumber++;
        if (this.room.hacker18) {
            this.kick(this.room.hacker18);
            this.room.hacker18 = null;
        } else if (this.currentPlayerNumber >= this.amountOfPlayers) {
            this.election.determineLosers();
            this.losers = this.election.losersID.slice();
            if (!this.changingVotes) {
                this.lastLosers = this.losers.slice(); // copy
                Object.keys(this.players).forEach(socketId => {
                    this.sockets[socketId].emit(Constants.MSG_TYPES.DIALOG_MESSAGE, "Результат:<br />\n" + this.election.toString() + "<br />\nЧерез 10 секунд будет выдано по 60 секунд на оправдание");
                });
                setTimeout(this.startJustification.bind(this), 10000, this.players[this.losers.shift()].username);
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
        } else {
            this.sendVoteStarted();
        }
    }

    startJustification(username) {
        Object.keys(this.sockets).forEach(socketId => {
            this.sockets[socketId].emit(Constants.MSG_TYPES.JUSTIFICATION_STARTED, username);
        });
        this.timer = setTimeout(this.endJustification.bind(this), Constants.JUSTIFICATION_TIME_SECS * 1000);
    }

    endJustification() {
        Object.keys(this.sockets).forEach(socketId => {
            this.sockets[socketId].emit(Constants.MSG_TYPES.JUSTIFICATION_ENDED);
        });
        if (this.losers.length == 0) {
            this.currentPlayerNumber = 0;
            this.changingVotes = true;
            this.sendVoteStarted();
        } else {
            this.startJustification(this.players[this.losers.shift()].username)
        }
    }

    onUserEndJustiff(socket) {
        if (this.election.losersID.includes(socket.id)) {
            clearTimeout(this.timer);
            this.endJustification();
        }
    }
    
    kick(loserID) {
        if (loserID == this.room.hacker19) {
            this.room.hacker19 = null;
            this.room.target19 = null;
        }
        if (loserID != this.room.hacker22) {
            Object.keys(this.players).forEach(socketId => {
                this.sockets[socketId].emit(Constants.MSG_TYPES.DIALOG_MESSAGE, `Игрок ${this.players[loserID].username} был изгнан!`);
            });
            this.players[loserID].kicked = true;
        } else {
            Object.keys(this.players).forEach(socketId => {
                this.sockets[socketId].emit(Constants.MSG_TYPES.DIALOG_MESSAGE, `Игрок ${this.players[loserID].username} под защитой своей спецкарты!`);
            });
        }
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
        let result = arr1.length == arr2.length;
        if (result) {
            arr1.forEach(el => {
                if (!arr2.includes(el)) result = false;
            });
        }
        return Boolean(result);
    }

    static contains(smalerArr, biggerArr) {
        let result = true;
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