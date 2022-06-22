const net = require("net");
const fs = require("fs");

const processRequest = require("./processRequest.js");

const config = require("../config.js");

const Room = require("./Room.js");

const accounts = require("./accounts.json");

module.exports.httpServer = processRequest(3000);

module.exports.httpServer.get("/top", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const acctsOrder = Object.values(accounts).sort((x, y) => {
    return x.points + y.points;
  });

  let counter, min;
  acctsOrder.forEach( acc => {
    if (counter > 10) return;

    if (min === undefined || acc.points < min) {
      counter++;
      min = acc.points;
    }
  });

  res.write(JSON.stringify(acctsOrder.filter( acc => acc.points >= min).sort((x, y) => {
    return x.points + y.points;
  })));

  res.end();
});

module.exports.curPlayers = {};
module.exports.rooms = [];
let roomsCounter = 0;

let server;

function addToRoom(player, roomID) {
  if (!("account" in player)) return;

  let playerObj = player.account;

  let added = false;

  if (roomID !== "undefined") {
    if (roomID === "NULL") {
      player.write("Room ID undefined");
      return;
    }

    if (!(/^\d+$/.test(roomID))) {
      player.write("Rooms' ID are numeric");
      return;
    }

    if (module.exports.rooms[roomID] === undefined) {
      player.write(`Room with the ID ${roomID} doesn't exist`); 
      return;
    }

    if (module.exports.rooms[roomID].getCanAdd())
      module.exports.rooms[roomID].addPlayer(player);
    else
      player.write(`Room with the ID ${roomID} it's full`);

    return;
  }

  for (let room in module.exports.rooms)
    if (module.exports.rooms[room].getCanAdd()) {
      added = true;
      module.exports.curPlayers[playerObj.name].room = +room;
      module.exports.rooms[room].addPlayer(player);
      return;
    }

  if (added) return;
  
  module.exports.curPlayers[playerObj.name].room = +roomsCounter;
  module.exports.rooms[roomsCounter++] = new Room(this, player);

  return;
}

function removeToRoom(player) {
  if (!("account" in player))
    return;

  const playerObj = module.exports.curPlayers[player.account.name];

  module.exports.rooms[playerObj.room].removePlayer(player.account.name);

  if (module.exports.rooms[playerObj.room].isEmpty())
    delete module.exports.rooms[playerObj.room];

  delete playerObj.room;

  fs.writeFile(config.database, `${JSON.stringify(accounts)}`, err => {
    if (err)
      throw err;
  });

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

      console.log(dataObj);

      if (dataObj.toRoom) {
        module.exports.rooms[module.exports.curPlayers[connection.account.name].room].toAll(dataObj.toRoom);

        return;
      }

      if (dataObj.listRooms) {
        if (dataObj.listRooms === "all")
          connection.write(`roomsList=${JSON.stringify(module.exports.rooms)}`);
        else
          connection.write(`roomsList=${JSON.stringify(module.exports.rooms.filter(r => r.getCanAdd()))}`);

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

        
        connection.write(`logged in as ${logIn.name}&player=${JSON.stringify(logIn)}`);

        connection.account = logIn;

        module.exports.curPlayers[logIn.name] = connection.account;
      }

      if (dataObj.chose) {
        const datata = JSON.parse(dataObj.chose);

        module.exports.rooms[module.exports.curPlayers[connection.account.name].room].play(datata.name, +datata.number);
      }
  
      if (dataObj.queue)
        addToRoom(connection, dataObj.queue);

      if (dataObj.quitRoom) {
        removeToRoom(connection);
      }

      if (dataObj.logout) {
      if (!connection.account) return;

      if ("room" in module.exports.curPlayers[dataObj.logout])
        removeToRoom(connection);

      if ('account' in connection)
        delete module.exports.curPlayers[dataObj.logout];
      }
    });
  
    connection.on("end", () => {
      if (!connection.account) return;

      if ("room" in module.exports.curPlayers[connection.account.name])
        removeToRoom(connection);

      if ('account' in connection)
        delete module.exports.curPlayers[connection.account.name];
    });
  
    connection.on("error", e => console.error(e.toString()));
  });

  server.listen(port);
};
