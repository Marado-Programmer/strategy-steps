let currentService;

module.exports = {
  name: "help",
  aliases: [ 'h', "man" , '?', ],
  requirements: [],
  description: {
    base: "Shows list of current avaliable commands for the current user.",
  },
  execution: (service, ...args) => {
    currentService = service;

    let helpMessage = '';

    if (args.length >= 1)
      args.forEach(i => helpMessage += extendedCommandHelper(i));
    else
      for (const i in service.commands) helpMessage += commandHelper(i);

    return {
      message: helpMessage,
    };
  },
}

function commandHelper(commandName) {
  const command = currentService.commands[commandName];

  if ('requirements' in command)
    if (command.requirements.every?.(requirement => currentService.specs.includes(requirement)))
      return `\t${command.name} --- ${command.description.base ? command.description.base : "(no description!)"}\n`;
  
  return '';
}
  
function extendedCommandHelper(commandName) {
  const command = currentService.commands?.[commandName];

  if (command === undefined)
    return `Command ${commandName} doesn't exist.\n`;

  return `\t${command.name} --- ${command.description.base ? command.description.base : "(no description!)"}${command.description.extended ? ("\n\n" + command.description.extended + "\n\n") : ''}`;
}
  
