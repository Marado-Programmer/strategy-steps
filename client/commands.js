function generateCommands() {
  let obj = {}

  require('fs').readdirSync(`${__dirname}/commands/`).forEach(name => {
    obj[name.replace(/\.js/, '')] = require(`./commands/${name}`);
  });

  return obj;
}

module.exports = generateCommands();