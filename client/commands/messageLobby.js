module.exports = {
  name: "messageLobby",
  aliases: [ "msgLobby", ],
  requirements: [ "connected", "loggedIn", "inRoom" ],
  description: {
    base: "msgLobby",
    extended: "",
  },
  execution: async (service, ...args) => {
    await service.service.write(`toRoom=${args.join(' ')}`);

    return { message: '', };
  }
}
