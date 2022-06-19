const core = require('../core.js');
let client = require('./client.js');

client.commands = require('./commands.js');
client.specs = [];

core.start(client);

client.readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  removeHistoryDuplicates: true,
  prompt: ': ',
}).on('line', data => {
  const [command, ...args] = data.toString().trim().split(' ');

  if (!command) {
    client.readline.prompt();
    return;
  }

  for (const i in client.commands) {
    const currentCommand = client.commands[i];

    if (command === i || currentCommand.aliases.includes(command)) {
      console.log(currentCommand.execution(client, ...args).message);
      client.readline.prompt();
      return;
    }
  }

  console.log(`command ${command} not found`);
  client.readline.prompt();
  return;
});
