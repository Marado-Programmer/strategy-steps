module.exports = {
  name: "logout",
  aliases: [ ],
  requirements: [ "loggedIn", ],
  description: {
    base: "Log Out",
    extended: "",
  },
  execution: async (service, ...args) => {
    await service.service.write(`logout=${service.account.name}`);

    service.specs = service.specs.filter(spec => spec !== "loggedIn");

    service.account = null;

    service.readline.setPrompt(
        `${service.account?.name ?? "(no account!)"}@`
      + `${service.service?.remoteAddress ?? ''}`
      + `${service.service?.remotePort ? ':' + service.service.remotePort : ''}`
      + ` > `
    );

    return {
      message: "Connected to the Socket",
    };
  }
}
