// The realtime/WebSocket server for kitchen and POS interfaces.
const ws = require("ws");

const component = "rtserver"

module.exports = function(sh) {
	const server = new ws.Server({ port: 8090 });
	server.on('connection', (socket) => {
		socket.on('message', (msg) => {
			console.log(msg);
		});
	});
}