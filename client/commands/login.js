module.exports = {
  name: "login",
  aliases: [ ],
  requirements: [ "connected" ],
  description: {
    base: "Log in into your account or as a Guest",
    extended: "",
  },
  execution: async (service, ...args) => {
    service.readline.pause();

    return await logIn(service);
  }
}

function logIn(service) {
  service.readline.question('enter your username: ', answerUsername => {
    service.readline.question('enter your password: ', answerPassword => {
      service.service.write(`logIn=${JSON.stringify({
        name: answerUsername,
        password: answerPassword,
      })}`);
      
      service.readline.resume();

      return {
        message: "Trying to log in.",
      };
    });
  });
}
