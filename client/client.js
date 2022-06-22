const net = require('net');
const fs = require('fs');

let hostClient;

module.exports = {
  name: "client",

  init: async (configuration, client) => {
    hostClient = client;

    module.exports.configuration = configuration;

    module.exports.service = net.connect(configuration, () => {
      console.log("connection is successfully established:", module.exports.service.address());

      hostClient.readline.setPrompt(
          `${client.account?.name ?? "(no account!)"}@`
        + `${client.service?.remoteAddress ?? ''}`
        + `${client.service?.remotePort ? ':' + client.service.remotePort : ''}`
        + ` > `
      );
    });

    module.exports.service.on('data', async data => {
      const dataObject = createDataObject(data);

      if (dataObject.player) {
        hostClient.account = JSON.parse(dataObject.player);

        hostClient.readline.setPrompt(
            `${client.account?.name ?? "(no account!)"}@`
          + `${client.service?.remoteAddress ?? ''}`
          + `${client.service?.remotePort ? ':' + client.service.remotePort : ''}`
          + ` > `
        );

        hostClient.readline.prompt();

        return;
      }

      if (dataObject.roomsList) {
        console.clear();
        console.log(JSON.parse(dataObject.roomsList));
        hostClient.readline.prompt();
        return
      }

      if (dataObject.clear) {
        console.clear();
        console.log(dataObject.clear);
        
        hostClient.readline.prompt();

        return;
      }

      if (dataObject.showScore) {
        const playerz = JSON.parse(dataObject.showScore);

        let representation = '';

        for (const p in playerz) {
          const cP = playerz[p];

          representation += "\n"

          for (let i = 0; i < 12; i++) {
            if (i >= (12 - cP.stair)) {
              representation += "#";
              continue;
            }

            representation += i === 0 ? "F" : "-";
          }

          representation += ` (${cP.stair})\t${cP.account.name}`;
        }

        console.log(representation);

        return;
      }

      if (dataObject.read) {
        console.clear();
        hostClient.readline.setPrompt(dataObject.read);
        hostClient.specs.push("playing");
        hostClient.readline.prompt();
        return;
      }

      if (dataObject.replay) {
        return await hostClient.readline.question(dataObject.replay);
      }

      if (dataObject.endRead) {
        hostClient.readline.setPrompt(
            `${client.account?.name ?? "(no account!)"}@`
          + `${client.service?.remoteAddress ?? ''}`
          + `${client.service?.remotePort ? ':' + client.service.remotePort : ''}`
          + ` > `
        );

        hostClient.specs = hostClient.specs.filter( s => s !== "playing" );

        hostClient.readline.prompt();

        return;
      }

      console.log(dataObject);

      hostClient.readline.prompt();
    });

    module.exports.service.on("timeout", () => {
      console.log("waiting for connection");
    });
    
    module.exports.service.on("lookup", (err, address, family, host) => {
      if (err) return console.error(err);
        
      console.log(address, family, host);
    });
    
    module.exports.service.on("ready", () => {
      console.log("socket is ready to be used");

      hostClient.readline.prompt();
    });
    
    module.exports.service.on("error", () => {
      hostClient.specs = hostClient.specs.filter(spec => spec !== "connected" || spec !== "loggedIn")

      delete hostClient.account;

      console.error("An error occured");
    });

    module.exports.service.on("close", hadError => {
      console.log("socket closed" + (hadError ? " because of an error" : ""));
      hostClient.readline.prompt();
      hostClient = null;
    });
  },
};

function createDataObject(data) {
  const dataString = data instanceof Buffer ? data.toString() : data;

  const dataArray = dataString.split('&');
  
  const dataObject = {};
  
  dataArray.forEach(arrayValue => {
    let key, value;
  
    [key, value] = arrayValue.split('=');
  
    dataObject[key] = value;
  });

  return dataObject;
}
