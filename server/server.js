const net = require("net");
const fs = require("fs");
const config = require("../config.js");

const Room = require("./Room.js");

const accounts = require("./accounts.json");

module.exports.curPlayers = {};
module.exports.rooms = [];
let roomsCounter = 0;

let server;

function addToRoom(player) {
  if (!("account" in player)) return;

  let playerObj = player.account;

  let added = false;

  for (let room in module.exports.rooms)
    if (module.exports.rooms[room].getCanAdd()) {
      added = true;
      module.exports.curPlayers[playerObj.name].room = +room;
      module.exports.rooms[room].addPlayer(player);
      return;
    }

  if (added) return;
  
  module.exports.curPlayers[playerObj.name].room = +roomsCounter;
  module.exports.rooms[roomsCounter++] = new Room(player);

  return;
}

function removeToRoom(player, add = true) {
  if (!("account" in player))
    return;

  let playerObj = module.exports.curPlayers[player.account.name];

  module.exports.rooms[playerObj.room].removePlayer(player);

  if (module.exports.rooms[playerObj.room].isEmpty())
    delete module.exports.rooms[playerObj.room];

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

      if (dataObj.toRoom) {
        module.exports.rooms[module.exports.curPlayers[connection.account.name].room].toAll(dataObj.toRoom);

        return;
      }

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

        if (logIn.name in module.exports.curPlayers) {
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

        module.exports.curPlayers[logIn.name] = connection.account;
      } else if (dataObj.logInGuest) {
        let logIn;
        do {
          logIn = {
            name: `Guest${Math.round(Math.random() * 0xfffffff).toString(16)}`,
            type: "Guest",
          }

        } while (logIn.name in module.exports.curPlayers);

        
        connection.write(`logged+in+as+${logIn.name}&player=${JSON.stringify(logIn)}`);

        connection.account = logIn;

        module.exports.curPlayers[logIn.name] = connection.account;
      }

      if (dataObj.chose) {
        console.log(dataObj);
//        module.exports.rooms[connection.account.room].play(connection.account.name, +dataObj.chosenNumber);
      }
  
      if (dataObj.queue)
        addToRoom(connection);

      if (dataObj.newGame) {
        removeToRoom(connection);
      }

      if (dataObj.logout) {
        delete module.exports.curPlayers[dataObj.logout];
      }
    });
  
    connection.on("end", () => {
      if (!connection.account) return;

      if ("room" in module.exports.curPlayers[connection.account.name])
        removeToRoom(connection, false);

      if ('account' in connection)
        delete module.exports.curPlayers[connection.account.name];
    });
  
    connection.on("error", e => console.error(e.toString()));
  });

  server.listen(port);
};
