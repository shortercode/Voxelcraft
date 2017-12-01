const http = require('http');
const fs = require('fs');
const path = require('path');
const util = require('util');

const ROOT = "./";
const PORT = 80;

const server = http.createServer((request, response) => {
	const source = request.url;
	const readStream = fs.createReadStream(source);
	readStream.on("open", () => {
		readStream.pipe(response);
	});
	readStream.on("error", () => {
		response.statusCode = 400;
		response.end(err.code);
	})
});

server.listen(PORT, err => {
	if (err) {
		console.log("Failed to start server", err);
	} else {
		console.log("Started server on port " + PORT);
	}
})
