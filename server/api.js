// Server for "REST" API requests xd
// I don't even know what REST means tbh
// i think it's one of those buzzwords
const component = "api";
const acceptedClients = ["dotnet", "js"]

module.exports = function (app, db, auth, sh) {
	app.post("/api/test", (req, res) => {
		sh.log("POST /api/test/ from " + req.ip, component, true);
		//console.log(req.body);
		if (req.body && req.body.client && acceptedClients.indexOf(req.body.client) > -1) {
			return res.json({ 
				version: "OrderSoft server v1.0.0",
				acceptedClient: true
			});
		}
		return res.json({ 
			version: "OrderSoft server v1.0.0",
			acceptedClient: false
		});
	});
}