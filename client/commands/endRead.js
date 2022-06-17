let userClient;

function readableOff() {
  userClient.readline.removeAllListeners("line");
}

module.exports = {
  name: "endRead",
  aliases: [],
  description: "disattach events of readline",
  execution: (data, client) => {
    userClient = client;

    readableOff();

    return { message: '', };
  },
}
