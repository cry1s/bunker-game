const Constants = require("../shared/constants");
const Elections = require("./vote");
const ElectionStage = require("./electionstage");

class SpeccardManager {
    // all cards https://docs.google.com/spreadsheets/d/1rRKfvFjzKkI5rT6Q7vPANhn1NTAZ-7mPaCmoxgtmVu4/edit#gid=0&range=I2
    static cards = {};
    constructor(room) {
        this.room = room;
        this.players = room.players;
        this.sockets = room.sockets;
        this.usedSpeccards = [];
        this.waitForChoose = {};
    }

    onUseSpeccard(socket, id) {
        switch (Number(id)) {
            // Данная карта дает тебе возможность открыть
            // карту любой категории у любого игрока на выбор 
            case 1:
                this.sendChoose(socket.id, Constants.SPECCARD_CHOOSE_TYPE.LIVING_CHACS);
                this.waitForChoose[socket.id] = id;
                break;

            // Данная карта дает тебе возможность
            // возвратить любого выбывшего игрока в игру
            case 2:
                this.sendChoose(socket.id, Constants.SPECCARD_CHOOSE_TYPE.KICKED);
                this.waitForChoose[socket.id] = id;
                break;
            
            // Данная карта дает тебе возможность
            // поменяться картой Фобия с любым игроком на выбор
            case 3:
                this.sendChoose(socket.id, Constants.SPECCARD_CHOOSE_TYPE.LIVING_EXCEPT_ME);
                this.waitForChoose[socket.id] = id;
                break;

            // Данная карта дает тебе возможность
            // поменяться картой Здоровье с человеком следующего номера
            case 4:
                const owner = Object.keys(this.players).indexOf(socket.id);
                let next = ((owner + 1) == Object.keys(this.players).length) ? 0 : (owner + 1);
                while( this.players[ Object.keys(this.players)[next] ].kicked && next != owner ) {
                    if (++next == Object.keys(this.players).length) {
                        next = 0;
                    }
                }
                if (next != owner) {
                    const player1 = this.players[Object.keys(this.players)[owner]]
                    const player2 = this.players[Object.keys(this.players)[next]]
                    player1.tradeCardWithPlayer(player2, "health");
                }
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;
            
            // Данная карта дает тебе возможность
            // поменяться картой Здоровье с любым игроком на выбор
            case 5:
                this.sendChoose(socket.id, Constants.SPECCARD_CHOOSE_TYPE.LIVING_EXCEPT_ME);
                this.waitForChoose[socket.id] = id;
                break;

            // Данная карта дает тебе возможность перераздать у всех игроков
            // (включая себя) Карточки Биологическая характеристика
            case 6:
                Object.keys(this.players).forEach(playerID => {
                    const player = this.players[playerID];
                    player.makeBioCard();
                });
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;

            // Данная карта дает тебе возможность перераздать у всех игроков
            // (включая себя)  Карточки Профессия
            case 7:
                Object.keys(this.players).forEach(playerID => {
                    const player = this.players[playerID];
                    player.retakeCard(this.room.deck.jobs, "job");
                });
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;

            // Данная карта дает тебе возможность перераздать у всех игроков
            // (включая себя)  Карточки Фобии
            case 8:
                Object.keys(this.players).forEach(playerID => {
                    const player = this.players[playerID];
                    player.retakeCard(this.room.deck.fobies, "fobia");
                });
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;

            // Данная карта дает тебе возможность перераздать у всех игроков
            // (включая себя)  Карточки Доп. информация
            case 9:
                Object.keys(this.players).forEach(playerID => {
                    const player = this.players[playerID];
                    player.retakeCard(this.room.deck.infos, "info");
                });
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;
            
            // Данная карта дает тебе возможность перераздать у 
            // всех игроков (включая себя) Карточки Здоровья
            case 10:
                Object.keys(this.players).forEach(playerID => {
                    const player = this.players[playerID];
                    player.retakeCard(this.room.deck.healths, "health");
                });
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;
            
            // Данная карта дает тебе возможность перераздать у 
            // всех игроков (включая себя) Карточки Хобби
            case 11:
                Object.keys(this.players).forEach(playerID => {
                    const player = this.players[playerID];
                    player.retakeCard(this.room.deck.hobbies, "hobby");
                })
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;

            // Ты можешь поменять свою карту Биологическая характеристика
            // на новую случайную из колоды
            case 12:
                this.players[socket.id].makeBioCard();
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;
            
            // Ты можешь поменять свою карту Фобия на новую случайную из колоды
            case 13:
                this.players[socket.id].retakeCard(this.room.deck.fobies, "fobia");
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;
            
            // Данная карта дает возможность вылечить твою фобию
            case 14:
                this.players[socket.id].fobia.text = "Нет фобий";
                this.players[socket.id].openCard("fobia");
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;
            
            // Ты можешь поменять свою карту Профессия на новую случайную из колоды
            case 15:
                this.players[socket.id].retakeCard(this.room.deck.jobs, "job");
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;
            
            // Ты можешь поменять свою карту Дополнительная информация на новую из колоды
            case 16:
                this.players[socket.id].retakeCard(this.room.deck.infos, "info");
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;

            // Данная карта дает возможность вылечить тебя от любого недуга, теперь ты абсолютно здоров)
            case 17:
                this.players[socket.id].health.text = "Идеально здоров";
                this.players[socket.id].openCard("health");
                this.usedSpeccards.push(id);
                this.room.shouldSendUpdate = true;
                this.sendUpdate(socket.id);
                break;
            
            // Данная карта дает тебе возможность самому выбрать кто покинет игровой круг без голосования
            case 18:
                this.sendChoose(socket.id, Constants.SPECCARD_CHOOSE_TYPE.LIVING_EXCEPT_ME);
                this.waitForChoose[socket.id] = id;
                break;

            // Данная карта дает тебе возможность забрать
            // голос другого игрока, теперь у тебя их два
            case 19:
                this.sendChoose(socket.id, Constants.SPECCARD_CHOOSE_TYPE.LIVING_EXCEPT_ME);
                this.waitForChoose[socket.id] = id;
                break;

            // Данная карта дает возможность аннулировать один голос против тебя
            case 20:
                this.room.hacker20 = socket.id;
                this.usedSpeccards.push(id);
                this.sendUpdate(socket.id);
                break;

            // У тебя есть защита на один игровой круг другого игрока,
            // ты не можешь защитить себя
            case 21:
                this.sendChoose(socket.id, Constants.SPECCARD_CHOOSE_TYPE.LIVING_EXCEPT_ME);
                this.waitForChoose[socket.id] = id;
                this.sendUpdate(socket.id);
                break;
            
            // У тебя есть защита на один игровой круг,
            // если против твоего персонажа максимальное количество голосов
            case 22:
                this.room.hacker22 = socket.id;
                this.usedSpeccards.push(id);
                this.sendUpdate(socket.id);
                break;

            // карты на плюс правила
            case 25:
            case 27:
            case 28:
            case 29:
            case 30:
            case 31:
            case 32:
            case 34:
            case 35:
                this.room.plusTerms(SpeccardManager.cards[id]);
                this.usedSpeccards.push(id);
                this.sendUpdate(socket.id);
                break;
            
            // Количество мест в бункере больше на 1
            case 26:
                this.room.plusTerms(SpeccardManager.cards[id]);
                this.room.amountPlayersToEnd++;
                this.usedSpeccards.push(id);
                this.sendUpdate(socket.id);
                break;
            
            // Количество мест в бункере меньше на 1
            case 33:
                this.room.plusTerms(SpeccardManager.cards[id]);
                this.room.amountPlayersToEnd--;
                this.usedSpeccards.push(id);
                this.sendUpdate(socket.id);
                break;
        }
    }

    // var choose need to be like "1" or "job 1"
    onChoose(socket, choose) {
        const id = this.waitForChoose[socket.id];
        let chac, player, i;
        switch (Number(id)) {
            case 1:
                chac = String(choose).split(" ")[0];
                i = Number(String(choose).split(" ")[1]) - 1;
                player = this.players[ Object.keys(this.players)[i] ];
                console.log(player, Object.keys(this.players)[i], chac, i);
                player.openCard(chac);
                this.room.shouldSendUpdate = true;
                this.usedSpeccards.push(id);
                break;

            // Данная карта дает тебе возможность
            // возвратить любого выбывшего игрока в игру
            case 2:
                i = Number(choose) - 1;
                player = this.players[ Object.keys(this.players)[i] ];
                player.returnToGame();
                this.room.amountPlayers += 1;
                this.room.shouldSendUpdate = true;
                this.usedSpeccards.push(id);
                break;

            // Данная карта дает тебе возможность
            // поменяться картой Фобия с любым игроком на выбор
            case 3:
                i = Number(choose) - 1;
                player = this.players[ Object.keys(this.players)[i] ];
                player.tradeCardWithPlayer(this.players[socket.id], "fobia");
                this.room.shouldSendUpdate = true;
                this.usedSpeccards.push(id);
                break;

            // Данная карта дает тебе возможность
            // поменяться картой Здоровье с любым игроком на выбор
            case 5:
                i = Number(choose) - 1;
                player = this.players[ Object.keys(this.players)[i] ];
                player.tradeCardWithPlayer(this.players[socket.id], "health");
                this.room.shouldSendUpdate = true;
                this.usedSpeccards.push(id);
                break;

            // Данная карта дает тебе возможность 
            // самому выбрать кто покинет игровой круг без голосования
            case 18:
                i = Number(choose) - 1;
                this.room.hacker18 = Object.keys(this.players)[i]
                this.usedSpeccards.push(id);
                break;

            // Данная карта дает тебе возможность забрать
            // голос другого игрока, теперь у тебя их два
            case 19:
                i = Number(choose) - 1;
                let hacker19 = socket.id;
                let target19 = Object.keys(this.players)[i];
                this.room.hacker19 = hacker19;
                this.room.target19 = target19;
                this.usedSpeccards.push(id);
                break;

            // У тебя есть защита на один игровой круг другого игрока,
            // ты не можешь защитить себя
            case 21:
                i = Number(choose) - 1;
                this.room.hacker22 = Object.keys(this.players)[i];
                this.usedSpeccards.push(id);
                break;
        }
        this.sendUpdate(socket.id);
    }

    sendUpdate(socketid) {
        this.sockets[socketid].emit(Constants.MSG_TYPES.SPECCARD_UPDATE)
    }

    sendChoose(socketid, chooseType) {
        this.sockets[socketid].emit(Constants.MSG_TYPES.SPECCARD_CHOOSE_PROC, chooseType)
    }

    static isPassive(id) {
        return Boolean(id in Constants.PASSIVE_IDS);
    }

    getSpeccardUpdateByIds(id1, id2) {
        return {
            [id1]: {
                passive: SpeccardManager.isPassive(id1),
                used: (id1 in this.usedSpeccards),
                text: SpeccardManager.cards[id1],
            },
            [id2]: {
                passive: SpeccardManager.isPassive(id2),
                used: (id2 in this.usedSpeccards),
                text: SpeccardManager.cards[id2],
            },
        }
    }

    // Чтобы одержать победу тебе нужно попасть в бункер
    // вместе с игроком следующего номера
    case23() {
        const ownerID = this.checkForCard(23);
        if (ownerID) {
            const owner = Object.keys(this.players).indexOf(ownerID)
            let next = ((owner + 1) == Object.keys(this.players).length) ? 0 : (owner + 1);
            const nextID = Object.keys(this.players)[next]
            const ownerPlayer = this.players[ownerID];
            const nextPlayer = this.players[nextID];
            if (nextPlayer.kicked) ownerPlayer.kicked = true;
            this.room.shouldSendUpdate = true;
        }
    }

    // Человек следующего номера от тебя  -  враг,
    // если он останется в игре - ты проиграешь, даже попав в бункер.
    case24() {
        const ownerID = this.checkForCard(24);
        if (ownerID) {
            const owner = Object.keys(this.players).indexOf(ownerID)
            let next = ((owner + 1) == Object.keys(this.players).length) ? 0 : (owner + 1);
            const nextID = Object.keys(this.players)[next]
            const ownerPlayer = this.players[ownerID];
            const nextPlayer = this.players[nextID];
            if (!nextPlayer.kicked) ownerPlayer.kicked = true;
            this.room.shouldSendUpdate = true;
        }
    }

    checkForCard(id) {
        for (const playerID in this.players) {
            if (this.players.hasOwnProperty(playerID)) {
                const player = this.players[playerID];
                if (player.speccards.id1 == String(id) || player.speccards.id1 == String(id)) {
                    return playerID;
                }
            }
        }
        return null;
    }
}

module.exports = SpeccardManager;