let currentService;

module.exports = {
  name: "help",
  aliases: [ 'h', ],
  requirements: [],
  description: "Shows list of current avaliable commands for the current user.",
  execution: (service, ...args) => {
    currentService = service;

    helpMessage = '';

    if (args.length >= 1)
      args.forEach(i => helpMessage += commandHelper(i));
    else
      for (const i in service.commands) helpMessage += commandHelper(i);

    return {
      message: helpMessage,
    };
  },
}

function commandHelper(commandName) {
  const command = currentService.commands?.[commandName];

  if (command === undefined)
    return `Command ${commandName} doesn't exist.\n`;

  if (!('requirements' in command) || command.requirements.every(requirement => service.specs.includes(requirement)));
    return `\t${command.name} --- ${command.description ? command.description : "(no description!)"}\n`;
}
  