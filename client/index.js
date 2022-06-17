const core = require('../core.js');
let service = require('./client.js');

service.commands = require('./commands.js');

service.specs = [];

/*const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    removeHistoryDuplicates: true,
    prompt: ': ',
  });

readline.on('line', data => {
  readline.prompt();

  const readableData = data.toString().trim();

  client.write(readableData);
});*/

service = core.start(service);