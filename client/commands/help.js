let currentService;

module.exports = {
  name: "help",
  aliases: [ 'h', "man" , '?', ],
  requirements: [],
  description: {
    base: "Shows list of current avaliable commands for the current user.",
  },
  execution: async (service, ...args) => {
    currentService = service;

    let helpMessage = '';

    if (args.length >= 1)
      args.forEach(i => helpMessage += extendedCommandHelper(i));
    else
      for (const i in service.commands) helpMessage += commandHelper(i);

    return {
      message: `#Commands:\n${helpMessage}`,
    };
  },
}

function commandHelper(commandName) {
  const command = currentService.commands[commandName];

  if ('requirements' in command)
    if (command.requirements.every(requirement => currentService.specs.includes(requirement)))
      return ` * ${command.name} --- ${command.description.base ? command.description.base : "(no description!)"}\n`;
  
  return '';
}
  
function extendedCommandHelper(commandName) {
  const command = getCommand(commandName);

  if (command === undefined)
    return `Command ${commandName} doesn't exist.\n`;

  return `---\n * ${command.name} --- ${command.description.base ? command.description.base : "(no description!)"}${command.description.extended ? ('\n' + command.description.extended) : ''}${command.aliases ? "\n\n * Aliases: " + command.aliases : ''}\n`;
}
  
function getCommand(name) {
  for (const commandName in currentService.commands) {
    const command = currentService.commands[commandName];

    if (command.name === name || command.aliases.includes(name)) return command;
  }
}
