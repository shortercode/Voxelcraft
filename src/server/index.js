const http = require('http');
const fs = require('fs');
const path = require('path');
const util = require('util');

const ROOT = "./client";
const PORT = 80;

function getMime (ext) {
	switch (ext) {
		case "html":
			return "text/html";
		case "js":
			return "application/javascript";
		default:
			return 'text/plain';
	}
}

function resolveSource (url) {
	let source;
	let mime;



	if (url === "/") {
		source = "/index.html";
		mime = getMime("html");
	}
	else {
		source = url;
		const { ext } = path.parse(url);
		mime = getMime(ext.slice(1));
	}

	source = ROOT + source;

	return [ mime, source ];
}

const server = http.createServer((request, response) => {
	const [ mime, source ] = resolveSource(request.url)
	const readStream = fs.createReadStream(source);
	console.log(mime, source);
	readStream.on("open", () => {
		response.writeHead(200, { 'Content-Type': mime });
		readStream.pipe(response);
	});
	readStream.on("error", err => {
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
