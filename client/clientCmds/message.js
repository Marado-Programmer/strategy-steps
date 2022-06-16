module.exports = {
  name: "message",
  aliases: ["msg"],
  description: "console.log a message",
  execution: data => { return { message: data.replace(/\+/g, ' '), }; },
}
