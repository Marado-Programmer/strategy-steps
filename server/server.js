const net = require("net");
const fs = require("fs");
const config = require("../config.js");

const Room = require("./Room.js");

const accounts = require("./accounts.json");

const curPlayers = {};
const rooms = [];
let roomsCounter = 0;

let server;

function addToRoom(player) {
  if (!("account" in player)) return;

  let playerObj = player.account;

  let added = false;

  for (let room in rooms)
    if (rooms[room].getCanAdd()) {
      added = true;
      curPlayers[playerObj.name].room = +room;
      rooms[room].addPlayer(player);
      return;
    }

  if (added) return;
  
  curPlayers[playerObj.name].room = +roomsCounter;
  rooms[roomsCounter++] = new Room(player);

  return;
}

function removeToRoom(player, add = true) {
  if (!("account" in player))
    return;

  let playerObj = player.account;

  rooms[playerObj.room].removePlayer(player);

  if (rooms[playerObj.room].isEmpty())
    delete rooms[playerObj.room];

  delete playerObj.room;

  if (add)
    addToRoom(player);

  return;
}

module.exports.init = port => {
  if (server !== undefined) return;

  if (!port) throw new Error("port not specified");

  module.exports.port = port;

  server = net.createServer(connection => {
    connection.on("data", data => {
      const dataString = data instanceof Buffer ? data.toString() : data;

      const dataArray = dataString.split('&');
  
      const dataObj = {};
      
      dataArray.forEach(arrayValue => {
        let key, value;
  
        [key, value] = arrayValue.split('=');
  
        dataObj[key] = value;
      });

      if (dataObj.register) {
        let register = JSON.parse(dataObj.register);

        if (register.username in accounts) {
          connection.write(`username ${register.username} already taken`);
          return;
        }

        accounts[register.username] = {
          name: register.username,
          password: register.password,
          points: 0,
        };

        fs.writeFile(config.database, `${JSON.stringify(accounts)}`, err => {
          if (err)
            throw err;
        });

        connection.write(`account ${register.username} was created`);
      } else if (dataObj.logIn) {
        let logIn = JSON.parse(dataObj.logIn);

        if (logIn.name in curPlayers) {
          connection.write(`user ${logIn.name} already logged in`);
          return;
        }

        let err = false;

        if (!(logIn.name in accounts)) err = true;
        if (!err && accounts[logIn.name].password !== logIn.password) err = true;

        if (err) {
          connection.write(`wrong password for the ${logIn.name}`);
          return;
        }
        
        connection.write(`logged+in+as+${logIn.name}&player=${JSON.stringify(accounts[logIn.name])}`);

        connection.account = accounts[logIn.name];

        curPlayers[logIn.name] = connection.account;
      }

      if (dataObj.chosenNumber) {
        rooms[connection.account.room].play(connection.account.name, +dataObj.chosenNumber);
      }
  
      if (dataObj.queue)
        addToRoom(connection);

      if (dataObj.newGame) {
        removeToRoom(connection);
      }
    });
  
    connection.on("end", () => {
      removeToRoom(connection, false);
      if ('account' in connection)
        delete curPlayers[connection.account.name];
    });
  
    connection.on("error", e => console.error(e.toString()));
  });

  server.listen(port);
};
