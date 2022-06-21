const core = require('../core.js');
let client = require('./client.js');

client.account = null;

client.commands = require('./commands.js');
client.specs = [];

client.readline = require('readline/promises').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  completer: text => {
    const cmds = Object.keys(client.commands).filter(cmd => {
      const command = client.commands[cmd];

      if (!("requirements" in command)) return false;

      return command.requirements.every(requirement => {
        return client.specs.includes(requirement);
      });
    });
    const hits = cmds.filter(cmd => cmd.startsWith(text));

    return [hits.length ? hits : cmds, text];
  },
  removeHistoryDuplicates: true,
  prompt: `${client.account?.name ?? "(no account!)"}:${client.service?.remoteAddress ?? ''}${client.service?.localPort ? '@' + client.service.localPort : ''} > `,
}).on('line', data => {
  const [command, ...args] = data.toString().trim().split(' ');

  if (!command) {
    client.readline.prompt();
    return;
  }

  for (const i in client.commands) {
    const currentCommand = client.commands[i];

    if (command === i || currentCommand.aliases.includes(command)) {
      if (!("requirements" in currentCommand)) {
        console.log("You can't use this command");
        client.readline.prompt();
        return;
      }

      if (currentCommand.requirements.every(requirement => client.specs.includes(requirement))) {
        currentCommand.execution(client, ...args).then(obj => {
          console.log(obj.message ?? '');
          if (!obj.noPrompt) client.readline.prompt();
        });
        return;
      }

      console.log("You can't use this command");
      client.readline.prompt();
      return;
    }
  }

  console.log(`command ${command} not found`);
  client.readline.prompt();
  return;
});

core.start(client);
