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

  constructor(server, player = null) {
    this.server = server;
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

    this.notifyPlayers(`showScore=${JSON.stringify(this.#players)}`);

    setTimeout(() => {
      this.notifyPlayers("read=choose between the numbers 1, 3 and 5: ");

      this.guessingTime = setTimeout( () => {
        console.log('Time is up');
        this.checkWhoWins();
        this.notifyPlayers("endRead=true");
      }, this.#SECONDS_TO_CHOOSE * 1000);
    }, 1000);
  }

  play = (playerName, chosenNumber) => {
    this.#players[playerName].chosen = +chosenNumber;

    this.#players[playerName].write(`endRead=${chosenNumber}`);

    if (++this.#playsCounter >= Object.keys(this.#players).length) {
      clearTimeout(this.guessingTime);
      this.checkWhoWins();
    }
  };

  checkWhoWins() {
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

    setIntervalTimes(() => {
      this.notifyPlayers(`showScore=${JSON.stringify(this.#players)}`);
      for (let p in this.#players) {
        if (!cantWalk.some(i => i === this.#players[p].chosen)) {
          if (this.#players[p].chosen > 0) {
            this.#players[p].stair++;
            this.#players[p].chosen--;
          }
        }
      }
    }, 400, this.#SECONDS_TO_START, () => {
      let winner = undefined;

      for (let p in this.#players)
        if (this.#players[p].stair >= this.#STAIRS_NUMBER)
          if ((winner === undefined) || (this.#players[winner].stair < this.#players[p].stair))
            winner = this.#players[p].account.name;

      if (winner !== undefined) {
        this.notifyPlayers(`clear=the winner is ${winner}`);

        this.#players[winner].account.points++;
        this.endGame();
      } else {
        this.startRound();
      }
    });
  }

  endGame() {
    //this.notifyPlayers("replay=Exit Room? [Y/N]");

    let removed = false;

    this.guessingTime = setTimeout( () => {
      for (let p in this.#players) {
        const ans = this.#players[p].chosen;
        
        if (!(['N', 'n'].includes(ans))) {
          this.#players[p].chosen = 0;
          this.#players[p].write("quitRoom=true");
          this.removePlayer(this.#players[p].account.name);
          removed = true;
          continue;
        }

        this.#players[p].chosen = 0;
      }

      this.notifyPlayers("restarting game");
      this.guessingTime = setTimeout( () => {
        if (removed) {
          this.canAdd = true;
          this.canStart = false;
          this.#playsCounter = 0;
        }

        this.tryStart();
      }, this.#SECONDS_TO_CHOOSE * 1000);
    }, this.#SECONDS_TO_CHOOSE * 1000);
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
