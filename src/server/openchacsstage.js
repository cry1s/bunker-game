const Constants = require('../shared/constants');

class OpenChacsStage {
    constructor(players, sockets, three) {
        this.notKickedPlayers = [];
        this.notKickedSockets = [];
        this.shouldSendUpdate = false;
        for (let playerID in this.players) {
            if (!this.players[playerID].kicked) {
                this.notKickedPlayers.push(players[playerID]);
                this.notKickedSockets.push(sockets[playerID]);
            }
        }
        this.amountOfPlayers = this.notKickedPlayers.length;
        this.currentPlayerNumber = 0;
        this.needToOpen = three ? 3 : 1;
    }
    
    onUpdate() {
        
        return this.shouldSendUpdate;
    }

}