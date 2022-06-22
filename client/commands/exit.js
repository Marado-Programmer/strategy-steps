module.exports = {
  name: "exit",
  aliases: [ ],
  requirements: [ ],
  description: {
    base: "Exit",
    extended: null,
  },
  execution: async (service, ...args) => {
    process.exit();
  }
}
