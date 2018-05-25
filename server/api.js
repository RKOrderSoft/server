// Server for "REST" API requests xd
// I don't even know what REST means tbh
// i think it's one of those buzzwords
const component = "api";
const acceptedClients = ["dotnet", "js"];
const status = {
	OK: "OK",
	SESSION_EXPIRED: "SESSION_EXPIRED",
	INVALID: "INVALID",
	UNAUTHORISED: "UNAUTHORISED"
}
const version = "0.0.1"

module.exports = function (app, db, auth, sessions, sh) {
	// /api/test
	//   Test API, returns version info
	//   Used to identify OrderSoft server
	app.post("/api/test", async (req, res) => {
		sh.log("POST /api/test/ from " + req.ip, component, true);
		if (req.body && req.body.client && acceptedClients.indexOf(req.body.client) > -1) {
			return res.json(buildResponse(status.OK));
		}
		return res.json(buildResponse(status.INVALID, { reason: "Invalid format/client" }));
	});

	// /api/login
	//   Used for authentication
	//   Responds with a session id
	app.post("/api/login", async (req, res) => {
		sh.log("POST /api/login/ from " + req.ip, component, true);
		if (!(req.body.password && req.body.username)) {
			return res.json(buildResponse(status.INVALID));
		};

		var userRow;

		auth.authenticate(req.body.username, req.body.password).then(row => {
			userRow = row;
			return sessions.issueSessionId(req.ip.toString(), row);
		}).then(newSessionId => {
			return res.json(buildResponse(status.OK, {
				sessionId: newSessionId,
				accessLevel: userRow.accessLevel
			}));
		}).catch(err => {
			return res.json(buildResponse(status.INVALID, { 
				reason: err
			}));
		});
	});
}

function buildResponse(resStatus, data={}) {
	data.ordersoft_version = version;
	data.status = resStatus;
	return JSON.stringify(data);
}