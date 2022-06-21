module.exports = {
  name: "messageLobby",
  aliases: [ "msgLobby", ],
  requirements: [ "connected", "loggedIn", "inRoom" ],
  description: {
    base: "msgLobby",
    extended: "",
  },
  execution: (service, ...args) => {
    service.service.write(`toRoom=${args.join(' ')}`);

    return { message: '', };
  }
}
