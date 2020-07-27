const Constants = require('../shared/constants');

class Elections {
    constructor(playersObj) {
        this.players = Object.assign({}, playersObj);
        this.maxVotes = 0;
        this.currentVotes = 0;
        this.losersID = [];
        this.state = Constants.ELECTIONS_STATES.IN_PROGRESS;
        for (let key in this.players) {
            this.players[key] = {
                voted: false,
                voices: 0,
            }
            this.maxVotes++;
        }
    }

    vote(voterID, enemyID) {
        if (this.players[voterID].voted) {
            this.players[voterID].voted = false;
            this.players[this.players[voterID].voted].voices--;
            this.vote(voterID, enemyID);
        } else {
            this.players[voterID].voted = enemyID;
            this.currentVotes++;
            this.players[enemyID].voices++;
        }

        if (this.state == Constants.ELECTIONS_STATES.IN_PROGRESS && this.currentVotes == this.maxVotes) {
            this.determineLosers();
            this.state = Constants.ELECTIONS_STATES.FINISHED;
        }
    }

    determineLosers() {
        let curMaxVotes = -1;
        for (const playerID in this.players) {
            const player = this.players[playerID];
            if (player.voices > curMaxVotes) {
                curMaxVotes = player.voices;
                this.losersID = [];
                this.losersID.push(playerID);
            } else if (player.voices == curMaxVotes) {
                this.losersID.push(playerID);
            } 
        }
    }

}

module.exports = Elections;