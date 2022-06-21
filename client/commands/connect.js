module.exports = {
  name: "connect",
  aliases: [ "conn", ],
  requirements: [],
  description: {
    base: "Connect to a socket with the given arguments or by using the configuration file.",
    extended: "Use the -p flag to specify the port and the -h flag to specify the host.\nThe priority of the configuration goes to the flags.",
  },
  execution: async (service, ...args) => {
    let configuration;
    if (!args.includes("--ignore-config")) {
      const configurationFile = args.includes("-c") ? args[args.indexOf("-c") + 1] : "../../config.js";

      try {
        configuration = require(configurationFile).connectOptions;
      } catch (e) {
        return {
          message: "Couldn't find the configuration file.",
          error: e,
        };
      }
    }

    if (args.includes("-p"))
      configuration.port = args[args.indexOf("-p") + 1];

    if (args.includes("-h"))
      configuration.host = args[args.indexOf("-h") + 1];

    try {
      await service.init(configuration, service);
    } catch (e) {
      return {
        message: "Couldn't connect to the Socket.",
        error: e,
      };
    }

    service.specs.push("connected");

    return {
      noPrompt: true,
      message: "Connected to the Socket",
    };
  }
}
