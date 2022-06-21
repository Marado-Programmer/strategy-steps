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

      if (dataObject.clear) {
        console.clear();
        console.log(dataObject.clear);
        
        hostClient.readline.prompt();

        return;
      }

      if (dataObject.read) {
        //console.clear();
        
        let number;

        let time = false;

        do {
          const numberasdf = await hostClient.readline.question(dataObject.read);
          number = numberasdf;
          if (time) break;
        } while ([1,3,5].includes(number) && !time);

        setTimeout(() => {
          time = true;
          if ([1,3,5].includes(number)) {
            console.log(module.exports);
            module.exports.service.write("chose=" + JSON.stringify({
              chose: number,
              name: client.account?.name,
            }));
          }
        }, 5000);

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
