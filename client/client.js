const net = require('net');
const fs = require('fs');

module.exports = {
  name: "client",
  init: (configuration) => {
    module.exports.configuration = configuration;
    module.exports.service = net.connect(configuration);

    module.exports.service.on('data', data => {
      const dataObject = createDataObject(data);
    });

    module.exports.service.on("connect", () => {
      console.log("connection is successfully established:", module.exports.service.address());
    });
    
    module.exports.service.on("timeout", () => {
      console.log("waiting for connection");
    });
    
    module.exports.service.on("lookup", (err, address, family, host) => {
      console.log(err, address, family, host);
    });
    
    module.exports.service.on("ready", () => {
      console.log("socket is ready to be used");
    });
    
    module.exports.service.on("error", () => {
      console.error("An error occured");
    });

    module.exports.service.on("close", hadError => {
      console.log("socket closed" + (hadError ? " because of an error" : ""));
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
