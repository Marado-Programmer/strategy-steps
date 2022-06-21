const setIntervalTimes = require("./setIntervalTimes.js");
const Player = require("./Player.js");

module.exports = class Room {
  #MAX_PER_ROOM = 4;
  #SECONDS_TO_START = 5;
  #SECONDS_TO_CHOOSE = 10;
  #STAIRS_NUMBER = 12;

  #playersCounter = 0;
  #playsCounter = 0;
  
  #players = {};

  guessingTime;

  constructor(player = null) {
    this.canAdd = true;
    this.canStart = false;
    this.started = false;

    if (player) this.addPlayer(player);
  }

  getPlayers() {
    const list = [];

    for (let p in this.#players)
      list.push(this.#players[p]);

    return list;
  }

  addPlayer = player => {
    if (!this.canAdd) return;

    this.#players[player.account.name] = new Player(player);

    this.#playersCounter++;

    this.notifyPlayers(`clear=Room it's ${this.#playersCounter}/${this.#MAX_PER_ROOM}`);

    this.tryStart();
  }

  removePlayer = player => {
    delete this.#players[player];

    this.#playersCounter--;

    if (!this.started) {
      this.canAdd = true;
      this.canStart = false;
      this.notifyPlayers(`clear=Room it's ${this.#playersCounter}/${this.#MAX_PER_ROOM}`);
    }

    console.log('A player left the room:', player);
    console.log(`Room it's ${this.#playersCounter}/${this.#MAX_PER_ROOM}`);
    console.log('Current players:', this.getPlayers());
  }

  notifyPlayers(...messages) {
    //console.log('players were notified:', messages);

    /*
    messages.forEach(message => {
      for (let p in this.#players) {
        this.#players[p].write(message);
      }
    });
    */

    /*
    const notifications = messages.reduceRight((callable, message) => () => {
        for (let p in this.#players) {
          this.#players[p].write(message);
        }

        callable();
      }, () => {}
    );

    notifications();
    */

    /*
    const notifications = [];

    messages.forEach(message => {
      notifications.push(() => {
        for (let p in this.#players) {
          this.#players[p].write(message);
        }
      });
    });

    console.log(notifications);

    notifications.forEach(i => { console.log(i.toString()); i(); });
    */

    for (let p in this.#players) {
      this.#players[p].write(...messages);
    }
  }

  startGame() {
    this.notifyPlayers("clear= ");

    let secondsLeft = this.#SECONDS_TO_START;

    setIntervalTimes(() => {
      this.notifyPlayers(`clear=the game will start in ${secondsLeft--} seconds!`);
    }, 1000, this.#SECONDS_TO_START, () => {
      if (!this.canStart) {
        this.notifyPlayers(`clear=A player disconnected.\nRoom it's ${this.#playersCounter}/${this.#MAX_PER_ROOM}`);

        return;
      }

      this.started = true;
      this.notifyPlayers("started");

      setTimeout(() => {
        this.startRound();
      }, 1000);
    });
  }

  startRound() {
    this.#playsCounter = 0;

    this.notifyPlayers("read=choose between the numbers 1, 3 and 5: &code=chosenNumber");

    this.guessingTime = setTimeout( () => {
      console.log('Time is up');
      this.checkWhoWins();
    }, this.#SECONDS_TO_CHOOSE * 1000);
  }

  play = (playerName, chosenNumber) => {
    console.log('The player', this.#players[playerName], 'chosed the number', chosenNumber);

    if (![1, 3, 5].some(i => i === +chosenNumber)) {
      this.#players[playerName].write('prompt=true');
      return;
    }

    console.log('E passou');

    this.#players[playerName].chosen = +chosenNumber;

    console.log('The player', this.#players[playerName], 'can\'t chose the number now');
    this.#players[playerName].write(`endRead=${chosenNumber}`);

    if (++this.#playsCounter >= Object.keys(this.#players).length) {
      clearTimeout(this.guessingTime);
      console.log('All the players chosed a number');
      this.checkWhoWins();
    }
  };

  checkWhoWins() {
    console.log('Checking for wins');
    this.notifyPlayers("endRead=time is up");

    const chosenNumbers = [];
    const canWalk = [];
    const cantWalk = [];

    for (let p in this.#players)
      chosenNumbers.push(this.#players[p].chosen);

    chosenNumbers.forEach(i => {
      if (canWalk.includes(i)) {
        if (!cantWalk.includes(i)) cantWalk.push(i);
      } else {
        canWalk.push(i);
      }
    });

    console.log('The players in the room', this.getPlayers());

    for (let p in this.#players) {
      if (!cantWalk.some(i => i === this.#players[p].chosen)) {
        this.#players[p].stair += this.#players[p].chosen;
        console.log(this.#players[p], 'walked');
      }
      this.#players[p].chosen = 0;
    }

    let winner = undefined;

    for (let p in this.#players)
      if (this.#players[p].stair >= this.#STAIRS_NUMBER)
        if ((winner === undefined) || (this.#players[winner].stair < this.#players[p].stair))
          winner = this.#players[p].account.name;

    if (winner !== undefined) {
      this.notifyPlayers(`clear=the+winner+is+${winner}`);

      this.#players[winner].account.points++;
      this.endGame();
    } else {
      this.startRound();
    }
  }

  endGame() {
    console.log('the game ended. players', this.getPlayers());

    setTimeout(() => {
      this.notifyPlayers('queue=true');

      for (let p in this.#players) {
        this.removePlayer(this.#players[p].account.name);
      }

      this.canAdd = true;
      this.canStart = false;
      this.#playsCounter = 0;
      this.tryStart();
    }, 5000);
  }

  tryStart() {
    if (this.#playersCounter >= this.#MAX_PER_ROOM) {
      this.canAdd = false;
      this.canStart = true;
      this.started = false;
      this.startGame();
    }
  }

  getCanAdd = () => this.canAdd;

  isEmpty = () => this.#playersCounter === 0;

  toAll = msg => this.notifyPlayers(msg);
}
