module.exports = {
  name: "queue",
  aliases: [],
  description: "queue for a game",
  execution: (data, client) => {
    client.write('newGame=true');

    return { message: '', };
  },
}
