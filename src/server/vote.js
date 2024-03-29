const Constants = require('../shared/constants');

class Elections {
    
    constructor(playersObj, room) {
        this.players = Object.assign({}, playersObj);
        this.maxVotes = 0;
        this.room = room;
        this.currentVotes = 0;
        this.losersID = [];
        this.state = Constants.ELECTIONS_STATES.IN_PROGRESS;
        for (let key in this.players) {
            const username = this.players[key].username;
            this.players[key] = {
                username,
                voted: false,
                voices: 0,
            }
            this.maxVotes++;
        }
    }

    vote(voterID, enemyID) {
        if (this.players[voterID].voted) {
            this.players[voterID].voted = false;
            this.players[voterID].voices--;
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
        this.losersID = [];
        let curMaxVotes = -1;
        for (const playerID in this.players) {
            const player = this.players[playerID];

            // speccard case 20
            if (playerID == this.room.hacker20 && this.state != Constants.ELECTIONS_STATES.FINISHED) {
                if (--player.voices <= -1) {
                    player.voices = 0;
                }
            }

            if (player.voices > curMaxVotes) {
                curMaxVotes = player.voices;
                this.losersID = [];
                this.losersID.push(playerID);
            } else if (player.voices == curMaxVotes) {
                this.losersID.push(playerID);
            } 
        }
    }

    toString() {
        let result = "";
        Object.keys(this.players).forEach(key => {
            const player = this.players[key];
            result += player.username + " - " + player.voices + "<br />\n"
        })
        return result;
    }
}

module.exports = Elections;