module.exports = {
  name: "login",
  aliases: [ ],
  requirements: [ "connected" ],
  description: {
    base: "Log in into your account or as a Guest",
    extended: "To log in as a Guest use the -G flag. If you use the -u flag to automatically set the user name, -G won't work",
  },
  execution: async (service, ...args) => {
    service.readline.pause();

    if (args.includes("-u")) {
      if (!args[args.lastIndexOf("-u") + 1]) {
        return {
          message: "error: no username specified",
        };
      }

      return password(service, args[args.lastIndexOf("-u") + 1]);
    }

    if (args.includes("-G")) {
      service.service.write(`logInGuest=true`);
      
      service.readline.resume();

      service.specs.push("loggedIn");

      return {
        message: "Trying to log in as Guest.",
        noPrompt: true,
      };
    }

    return await logIn(service);
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
