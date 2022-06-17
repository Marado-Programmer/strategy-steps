module.exports = {
  name: "goodLogIn",
  aliases: [],
  description: "console.log a message when good log in",
  execution: data => { return { message: data.replace(/\+/g, ' '), }; },
}
