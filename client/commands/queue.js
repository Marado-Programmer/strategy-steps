module.exports = {
  name: "queue",
  aliases: [ 'q', ],
  requirements: [ "connected", "loggedIn", ],
  description: {
    base: "Queue to enter a Room and play stretagy Steps CLI",
    extended: "To specify a room to enter by their ID use the -R flag",
  },
  execution: async (service, ...args) => {;
    const room = args.includes("-R") ? args[args.includes("-R") + 1] : null
    service.service.write(`queue=${room}`);

    service.specs.push("inRoom");

    return { message: 'Queing...', };
  },
}
