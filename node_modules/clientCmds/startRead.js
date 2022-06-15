let userClient;

function readableOn(prompt, code = undefined) {
  userClient.readline.setPrompt(prompt);

  userClient.readline.on('line', data => {
    userClient.readline.prompt();

    const readableData = data.toString().trim();
/*  
    if (client === undefined) {
      console.log("error connecting to the server");
      setTimeout(initPrompt, 3000);
      return;
    }
*/
    code = code === undefined
      ? ''
      : code + '=';

    userClient.write(code + readableData);
  });

  userClient.readline.prompt();
}

module.exports = {
  name: "startRead",
  aliases: ["read"],
  description: "attach event line on readline",
  execution: (data, client) => {
    userClient = client;

    readableOn(...(data.replace(/\+/g, ' ').split('///')));

    return { message: '', };
  },
}
