module.exports = {
  name: "prompt",
  aliases: [],
  description: "set prompt for the readline",
  execution: (data, client) => {
    client.readline.prompt();

    return { message: '', };
  },
}
