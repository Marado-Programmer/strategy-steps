const setIntervalTimes = require("./setIntervalTimes.js");
const Player = require("./Player.js");

module.exports = class Room {
  #MAX_PER_ROOM = 2;
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

    console.log('A room created with this account: ', player.account);

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

    this.notifyPlayers(/*"clear=true", */`msg=Room it's ${this.#playersCounter}/${this.#MAX_PER_ROOM}`);
    /*
    setTimeout(() => {
      this.notifyPlayers(
        'msg=1--------------------------------',
        'msg=2',
        'msg=3',
        'msg=4',
        'msg=5'
      );
    }, 1000);
    setTimeout(() => {
      this.notifyPlayers(
        'msg=1--------------------------------',
        'msg=2',
        'msg=3',
        'msg=4',
        'msg=5'
      );
    }, 2000);
    setTimeout(() => {
      this.notifyPlayers(
        'msg=1--------------------------------',
        'msg=2',
        'msg=3',
        'msg=4',
        'msg=5'
      );
    }, 3000);
    setTimeout(() => {
      this.notifyPlayers(
        'msg=1--------------------------------',
        'msg=2',
        'msg=3',
        'msg=4',
        'msg=5'
      );
    }, 4000);
    setTimeout(() => {
      this.notifyPlayers(
        'msg=1--------------------------------',
        'msg=2',
        'msg=3',
        'msg=4',
        'msg=5'
      );
    }, 5000);

    console.log('A player entered the room:', player.account);
    console.log(`Room it's ${this.#playersCounter}/${this.#MAX_PER_ROOM}`);
    console.log('Current players:', this.getPlayers());
    */

    this.tryStart();
  }

  removePlayer = player => {
    delete this.#players[player];

    this.#playersCounter--;

    if (!this.started) {
      this.canAdd = true;
      this.canStart = false;
      this.notifyPlayers(`msg=Room it's ${this.#playersCounter}/${this.#MAX_PER_ROOM}`);
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
    this.notifyPlayers("clear=true");

    let secondsLeft = this.#SECONDS_TO_START;

    setIntervalTimes(() => {
      this.notifyPlayers(`msg=the game will start in ${secondsLeft--} seconds!`);
    }, 1000, this.#SECONDS_TO_START, () => {
      console.log('Game is starting with this players', this.getPlayers());

      if (!this.canStart) {
        this.notifyPlayers('msg=A player disconnected', `msg=Room it's ${this.#playersCounter}/${this.#MAX_PER_ROOM}`);

        console.log('But it didn\'t started');
        
        return;
      }

      console.log('It started with this players', this.getPlayers());

      this.started = true;
      this.notifyPlayers("msg=started");

      setTimeout(() => {
        this.startRound();
      }, 1000);
    });
  }

  startRound() {
    console.log('Round starts');
    console.log('Tells them to chose a number');
    this.#playsCounter = 0;

    let stringGame = "\tF........###\t=>nome1\n"
      + "\tF..........#\t=>nome2\n"
      + "\tF.....######\t=>nome3\n"
      + "\tF......#####\t=>nome4\n";

    this.notifyPlayers("clear=true", /*`msg=${stringGame}`, */"read=choose between the numbers 1, 3 and 5: ///chosenNumber");

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

    console.log('The players now', this.getPlayers());

    let winner = undefined;

    for (let p in this.#players)
      if (this.#players[p].stair >= this.#STAIRS_NUMBER)
        if ((winner === undefined) || (this.#players[winner].stair < this.#players[p].stair))
          winner = this.#players[p].account.name;

    if (winner !== undefined) {
      console.log('the player that won', this.#players[winner]);

      this.notifyPlayers(`msg=the+winner+is+${winner}`);

      this.#players[winner].account.points++;
      this.endGame();
    } else {
      console.log('this players', this.getPlayers(), 'goes to the next round');
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

      console.log('room now', this.getPlayers());

      this.canAdd = true;
      this.canStart = false;
      this.#playsCounter = 0;
      this.tryStart();
    }, 5000);
  }

  tryStart() {
    console.log('try to start the game');
    if (this.#playersCounter >= this.#MAX_PER_ROOM) {
      console.log('can start the game');
      this.canAdd = false;
      this.canStart = true;
      this.started = false;
      this.startGame();
    }
  }

  getCanAdd = () => this.canAdd;

  isEmpty = () => this.#playersCounter === 0;
}