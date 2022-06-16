const net = require('net');
const fs = require('fs');
const commandsList = require('./clientCmds.js');

let client = net.connect(require("../connectOptions.js"));

client.readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  removeHistoryDuplicates: true,
  prompt: ': ',
});


client.on('data', data => {
  const dataObject = createDataObject(data);

  for (let commandName in dataObject) {
    let executed = false;
    commandsList.commands.forEach(command => {
      if (commandName === command.name || command.aliases.includes(commandName)) {
        console.log(command.execution(dataObject[commandName], client).message);

        executed = true;
        return;
      }
    });

    if (!executed)
      console.log(dataObject[commandName]);
  }
});

client.on("connect", () => {
  console.log("connection is successfully established:", client.address());
});

client.on("timeout", () => {
  console.log("waiting for connection");
});

client.on("lookup", (err, address, family, host) => {
  console.log(err, address, family, host);
});

client.on("ready", () => {
  console.log("socket is ready to be used");
  commandsList.commands['error'].execution('showing initial prompt', client);
});

function createDataObject(data) {
  const dataString = data instanceof Buffer ? data.toString() : data;

  const dataArray = dataString.split('&');
  
  const dataObject = {};
  
  dataArray.forEach(arrayValue => {
    let key, value;
  
    [key, value] = arrayValue.split('=');
  
    dataObject[key] = value;
  });

  return dataObject;
}
