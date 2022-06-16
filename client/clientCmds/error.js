let userClient;

function initPrompt() {
  readableOff();
  console.clear();
  userClient.readline.question(
      "------------------\n"
    + "log in [1]\n"
    + "register [2]\n"
    + "\n"
    + "exit [0]\n"
    + "------------------\n"
    + "Choose on option: ",
    answer => {
      switch (+answer) {
        case 1:
          logIn();
          break;
        case 2:
          register();
          break;
        case 0:
          process.exit();
          break;
        default:
          initPrompt();
      }

      return;
    }
  );

  return;
}

function readableOff() {
  userClient.readline.removeAllListeners("line");
}

function logIn() {
  userClient.readline.question('enter your username: ', answerUsername => {
    userClient.readline.question('enter your password: ', answerPassword => {
      userClient.write(`logIn=${JSON.stringify({
        name: answerUsername,
        password: answerPassword,
      })}`);
    });
  });
}

function register() {
  userClient.readline.question('enter your new account username: ', answerUsername => {
    userClient.readline.question('enter a password for this username: ',
      answerPassword => {
        userClient.readline.question('repeat the password for this username: ',
          answerRPassword => {
            if (answerPassword !== answerRPassword) {
              console.log("you did not typed the same password");
              setTimeout(initPrompt, 3000);
              return;
            }
  
            userClient.write(`register=${JSON.stringify({
              username: answerUsername,
              password: answerPassword,
            })}`);
          }
        );
      }
    );
  });
}

module.exports = {
  name: "error",
  aliases: ["err",],
  description: "console.log a message and prompts the initial prompt",
  execution: (data, client) => {
    userClient = client;

    setTimeout(initPrompt, 3000);

    return { message: data.replace(/\+/g, ' '), };
  },
}
