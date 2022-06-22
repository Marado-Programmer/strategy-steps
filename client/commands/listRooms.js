module.exports = {
  name: "listRooms",
  aliases: [ "lsRooms", ],
  requirements: [ "connected", "loggedIn", ],
  description: {
    base: "List the current Rooms avaliable for you to join.",
    extended: "Use the flag -a too show even the ones who are full.",
  },
  execution: async (service, ...args) => {;
    if (args.includes("-a"))
      await service.service.write("listRooms=all");
    else
      await service.service.write("listRooms=normal");

    return { message: 'List of Rooms:', noPrompt: true, };
  },
}
