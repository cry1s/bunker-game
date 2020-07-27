const Constants = require('../shared/constants');

class OpenChacsStage {
    constructor(players, sockets, three) {
        this.finished = false;
        this.notKickedSockets = [];
        for (let playerID in sockets) {
            if (!players[playerID].kicked) {
                this.notKickedSockets.push(sockets[playerID]);
            }
        }
        this.amountOfPlayers = this.notKickedSockets.length;
        this.currentPlayerNumber = 0;
        this.mode = three; //true for 3, false for 1
        this.sendStartToPlayer();
    }

    sendStartToPlayer() {
        this.needToOpen = this.mode ? 3 : 1;
        const currentSocket = this.notKickedSockets[this.currentPlayerNumber];
        currentSocket.emit(Constants.MSG_TYPES.CHAC_OPEN_PROCESS_STARTED, this.needToOpen);
    }

    onChacOpen() {
        this.needToOpen--;
        if (this.needToOpen <= 0) {
            this.currentPlayerNumber++;
            if (this.currentPlayerNumber == this.amountOfPlayers) {
                this.finished = true;
                return;
            } else {
                this.sendStartToPlayer();
            }
        }
    }
}

module.exports = OpenChacsStage;