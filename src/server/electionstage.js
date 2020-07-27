const Constants = require('../shared/constants');
const Elections = require('./vote');

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
        this.losers = null;
        this.needToStartJustification = false;
        this.needToKick = needToKick;
        this.amountOfPlayers = this.notKickedSockets.length;
        this.currentPlayerNumber = 0;
        this.sendVoteStarted()
    }

    sendVoteStarted() {
        const socket = this.notKickedPlayers[this.currentPlayerNumber];
        socket.emit(Constants.MSG_TYPES.PLAYER_VOTE_STARTED);
    }

    onVote(enemyID) {
        const voterID = this.notKickedPlayers[this.currentPlayerNumber].socketId;
        this.election.vote(voterID, enemyID);
        this.currentPlayerNumber++;
        if (this.currentPlayerNumber >= this.amountOfPlayers) {
            this.losers = this.election.losersID;
        }
    }

    startJustification(username) {
        Object.keys(this.players).forEach(socketId => {
            this.sockets[socketId].emit(Constants.MSG_TYPES.JUSTIFICATION_STARTED, username);
        });
        setTimeout(this.endJustification, 65000);
    }

    endJustification() {
        Object.keys(this.players).forEach(socketId => {
            this.sockets[socketId].emit(Constants.MSG_TYPES.CHANGE_VOTE_STARTED, username);
        });
    }
}

module.exports = ElectionStage