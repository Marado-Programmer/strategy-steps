module.exports = {
  name: "queue",
  aliases: [ 'q', ],
  description: "queue for a game",
  execution: (service, ...args) => {
    service.service.write('queue=true');

    return { message: 'Queing', };
  },
}
