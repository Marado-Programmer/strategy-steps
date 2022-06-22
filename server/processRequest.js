const http = require('http'); 

module.exports = function createProcessRequest(port) {
	const entries = {}, paths = {};

	const methods = [
    'GET',
    'POST',
  ];

	methods.forEach(method => {
		paths[method] = {};

    entries[method.toLowerCase()] = (path, callable) => {
      paths[method][path] = callable;
    }
	});
	
	const server = http.createServer((req, res) => {
		res.setHeader('Access-Control-Allow-Origin','*');

		if (!paths[req.method][req.url]) {
			res.statusCode = 404;
			return res.end();
		}

		paths[req.method][req.url](req, res);
	});

  server.on("close", () => {
    console.log(`HTTP server (port ${port}) was closed`);
  });

  /*
  server.on("connect", (request, socket, head) => {
    console.log(request);
    console.log(socket);
    console.log(head);
  });

  server.on("connection", socket => {
    console.log(socket);
  });

  server.on("request", (request, response) => {
    console.log(request);
    console.log(response);
  });

  server.on("upgrade", (request, socket, head) => {
    console.log(request);
    console.log(socket);
    console.log(head);
  });
  */

  server.listen(port);

	return entries;
};
