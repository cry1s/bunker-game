const Constants = require('../shared/constants');

class Player {
  constructor(socketId, username, deck) {
    this.socketId = socketId;
    this.username = "";
    if (username) {
      this.username = username;
    } else {
      this.username = socketId;
    }
    this.kicked = false;
    this.returnable = true;
    this.ready = false;

    this.sex = null;          //
    this.orientation = null;  // Sum of = this.bio
    this.age = null;          //

    this.bio = null;          // Objects like
    this.job = null;          // {
    this.health = null;       //  "id": 17,
    this.hobby = null;        //  "text": "some card text",
    this.feel = null;         //  "isOpen": true/false;
    this.fobia = null;
    this.info = null;         // }
    this.bag = null;          // 
    this.speccards = null;    // 
    
    this.giveStartCards(deck);
  }

  giveStartCards(deck) {
    this.makeBioCard();
    this.giveRandomCard(deck.jobs, "job");
    this.giveRandomCard(deck.healths, "health");
    this.giveRandomCard(deck.hobbies, "hobby");
    this.giveRandomCard(deck.feels, "feel");
    this.giveRandomCard(deck.fobies, "fobia");
    this.giveRandomCard(deck.infos, "info");
    this.giveRandomCard(deck.bags, "bag");
    this.giveRandomSpecCards(deck.speccards);
  }

  openCard(chac) {
    this[chac].isOpen = true;
  }

  vote(voteo, enemyID) {
    voteo
  }

  returnToGame() {
    this.kicked = false;
  }

  tradeCardWithPlayer(player, chac) {
    player.openCard(chac);
    this.openCard(chac);
    let myCard = this[chac];
    this[chac] = player[chac];
    player[chac] = myCard;
  }

  retakeCard(deckSection, chac) {
    let cardBackToDeck = this[chac];
    this.giveRandomCard(deckSection, chac);
    this[chac].isOpen = cardBackToDeck.isOpen;
    deckSection[cardBackToDeck.id] = cardBackToDeck.text;
  }

  giveRandomSpecCards(deckSpeccardSection) {
    let n = Object.keys(deckSpeccardSection)[this.randomInt(0, Object.keys(deckSpeccardSection).length-1)];
    this.speccards = {
      "text1": deckSpeccardSection[n],
      "id1": n,
      "used1": false,
    };
    delete deckSpeccardSection[n];
    n = Object.keys(deckSpeccardSection)[this.randomInt(0, Object.keys(deckSpeccardSection).length-1)];
    this.speccards.id2 = n;
    this.speccards.text2 = deckSpeccardSection[n];
    this.speccards.used2 = false;
    delete deckSpeccardSection[n];
  }

  giveRandomCard(oTypeCards, keyToWrite) {
    let n = Object.keys(oTypeCards)[this.randomInt(0, Object.keys(oTypeCards).length-1)];
    this[keyToWrite] = {
      "text": oTypeCards[n],
      "id": n,
      "isOpen": false,
    };
    delete oTypeCards[n];
  }

  needToOpenChacs() {
    const chacs = ["job", "health", "bio", "hobby", "feel", "fobia", "info", "bag"];
    for (let i = 0; i < chacs.length; i++) {
      const chac = chacs[i];
      if (!this[chac].isOpen) {
        return true;
      }
    }
    return false;
  }

  genSexOrientAge() {
    this.sex = Math.random() > 0.5 ? "Мужчина" : "Женщина";
    // switch (this.randomInt(1, 3)) {
    //   case 2:
    //     this.orientation = "Бисексуал";
    //     break;
    //   case 3:
    //     this.orientation = this.sex == "Мужчина" ? "Гомо" : "Лесби";
    //     break;
    // }
    this.age = this.randomInt(18, 86);
  }

  makeBioCard() {
    this.genSexOrientAge();
    let text = this.sex;
    // if (this.orientation) text += "-" + this.orientation;
    text += (" " + this.age + " лет");

    let isOpen = this.bio === null ? false : this.bio.isOpen;

    this.bio = {
      text,
      "id": null,
      isOpen,
    };
  }

  randomInt(min, max) {
    // получить случайное число от (min-0.5) до (max+0.5)
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

  switchReady() {
    this.ready = !this.ready;
  }
}

module.exports = Player;