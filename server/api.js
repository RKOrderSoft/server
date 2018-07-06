// Server for "REST" API requests xd
// I don't even know what REST means tbh
// i think it's one of those buzzwords
const component = "api";
const acceptedClients = ["dotnet", "js"];
const version = "0.0.1";

module.exports = function (app, db, auth, sessions, sh) {
	// /api/test
	//   Test API, returns version info
	//   Used to identify OrderSoft server
	app.post("/api/test", async (req, res) => {
		sh.log("POST /api/test/ from " + req.ip, component, true);
		
		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		var resBody = {};
		
		if (req.body.test === true) {
			res.status(200);
		} else {
			res.status(400);
			resBody.reason = "malformed request (was a 'test': true provided?)";
		}

		return res.json(buildResponse(resBody));
	});

	// /api/login
	//   Used for authentication
	//   Responds with a session id
	app.post("/api/login", async (req, res) => {
		sh.log("POST /api/login/ from " + req.ip, component, true);

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		var resBody = {};

		if (!(req.body.password && req.body.username)) {
			res.status(400);
			resBody.reason = "Username or password field empty";
		};

		var userRow;

		auth.authenticate(req.body.username, req.body.password).then(row => {
			userRow = row;
			return sessions.issueSessionId(req.ip.toString(), row);
		}).then(newSessionId => {
			res.status(200);
			resBody.sessionId = newSessionId;
			resBody.accessLevel = userRow.accessLevel;
		}).catch(err => {
			res.status(401);
			reqBody.reason = err.toString();
		});

		return res.json(buildResponse(resBody));
	});

	// /api/order
	//   Used to retrieve and set order information
	app.get("/api/order", async (req, res) => {
		sh.log("GET /api/order/ from " + req.ip, component, true);
		const REQD_ACCESSLVL = 0;

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		var resBody = {};
		
		if () {
			// TODO check sessionId & access level
		} else if (req.body.orderId == undefined && req.body.tableNumber == undefined) {
			res.status(400);
			resBody.reason = "One of orderId";
		}

		return res.json(buildResponse(resBody));
	});
}

function checkAcceptedClient(req, res) {
	var client = req.get("client");
	var isAcceptedClient = acceptedClients.indexOf(client) > -1; // Check if in acceptedClients

	if (!isAcceptedClient) {
		res.status(400);
		res.json(buildResponse({ reason: "Invalid client name: " + client }));
	}

	return isAcceptedClient;
}

function buildResponse(data={}) {
	data.ordersoft_version = version;
	return JSON.stringify(data);
}