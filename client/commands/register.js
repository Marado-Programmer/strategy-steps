module.exports = {
  name: "register",
  aliases: [ "reg", ],
  requirements: [ "connected" ],
  description: {
    base: "Register your account on the DB file",
    extended: null,
  },
  execution: async (service, ...args) => {
    service.readline.pause();
    return await register(service);
  }
}

function register(service) {
  service.readline.question('enter your new account username: ',
    answerUsername => {
      service.readline.question('enter a password for this username: ',
        answerPassword => {
          service.readline.question('repeat the password for this username: ',
            answerRPassword => {
              if (answerPassword !== answerRPassword) {
                service.readline.resume();
                return {
                  message: "Error, you did not typed the same password",
                };
              }
  
              service.service.write(`register=${JSON.stringify({
                username: answerUsername,
                password: answerPassword,
              })}`);

              service.readline.resume();
              return {
                message: "Registered",
              };
            }
          );
        }
      );
    }
  );
}
