module.exports = {
  name: "play",
  aliases: [ 'p', ],
  requirements: [ "connected", "loggedIn", "inRoom", "playing" ],
  description: {
    base: "Make your Play in the game. Chose a number between [1, 3, 5].",
    extended: "Example: play 3",
  },
  execution: async (service, ...args) => {
    if ([1, 3, 5].includes(+args[0])) {
      await service.service.write(`chose=${JSON.stringify(
        {
          name: service.account.name,
          number: +args[0],
        }
      )}`);

      return {
        message: `You played ${args[0]}`,
        noPrompt: true,
      };
    }

    return {
      message: `You need to play a number between [1, 3, 5].`,
    };
  }
}

async function logIn(service) {
  return await password(service, await service.readline.question('enter your username: '));
}

async function password(service, answerUsername) {
  const answerPassword = await service.readline.question('enter your password: ');

  service.service.write(`logIn=${JSON.stringify({
    name: answerUsername,
    password: answerPassword,
  })}`);
    
  service.readline.resume();

  service.specs.push("loggedIn");

  return {
    message: "Trying to log in.",
    noPrompt: true,
  };
}
