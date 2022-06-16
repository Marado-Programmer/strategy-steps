const commandNames = [
  "message",
  "error",
  "goodLogIn",
  "startRead",
  "codeString",
  "endRead",
  "prompt",
  "clear",
  "queue",
];

function generateCommands() {
  let obj = {}

  for (let name of commandNames) {
    obj[name] = require(`./clientCmds/${name}.js`);
  }

  return obj;
}

module.exports = {
  commands: generateCommands(),
};
