// Server for "REST" API requests
const component = "api";
const acceptedClients = ["dotnet", "js"];
const version = "0.0.1";

/*
 * See documentation at
 * https://github.com/RKOrderSoft/server/wiki/API-reference
 * for full API use instructions
 */

module.exports = function (app, db, auth, sessions, orders, dishes, sh) {
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
		} else {
			// fields are present
			try {
				var userRow = await auth.authenticate(req.body.username, req.body.password);
				
				var newSessionId = await sessions.issueSessionId(req.ip.toString(), userRow);

				res.status(200);
				resBody.sessionId = newSessionId;
				resBody.accessLevel = userRow.accessLevel;
			} catch (err) {
				res.status(401);
				resBody.reason = err.toString();
			}
		}

		return res.json(buildResponse(resBody));
	});

	// /api/getOrder
	//   Used to retrieve order information
	app.post("/api/getOrder", async (req, res) => {
		sh.log("POST /api/getOrder/ from " + req.ip, component, true);

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		// Check access level
		if (!(await checkAccessLevel(sessions, req, res, 0))) return;

		var resBody = {};

		if (!(req.body.orderId) && !(req.body.tableNumber)) {
			// malformed request
			res.status(400);
			resBody.reason = "Either orderId or tableNumber must be provided.";
		} else {
			// Retrieve order details			
			var order = await orders.getOrder(req.body);

			// Check that order exists
			if (!order) {
				res.status(404);
				resBody.reason = `Order with ${ 
					typeof orderId == 'string' ? ("order ID " + orderId) : ("table number " + tableNum) 
				} not found.`;
			} else {
				res.status(200);
				resBody.order = order;
			}
		}

		return res.json(buildResponse(resBody));
	});

	// /api/getOrderIds
	//   Used to search for orderIds matching parameters
	app.post("/api/getOrderIds", async (req, res) => {
		sh.log("POST /api/getOrderIds/ from " + req.ip, component, true);

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		// Check access level
		if (!(await checkAccessLevel(sessions, req, res, 0))) return;

		var searchResults = await orders.searchIds(req.body);

		return res.json(buildResponse({ results: searchResults }));
	});

	// /api/setOrder
	//   Used to modify or add orders to database
	app.post("/api/setOrder", async (req, res) => {
		sh.log("POST /api/setOrder from " + req.ip, component, true);
		
		// Check client
		if (!checkAcceptedClient(req, res)) return;

		// Check access level
		if (!(await checkAccessLevel(sessions, req, res, 0))) return;

		var resBody = {};

		if (req.body.order === undefined) {
			res.status(400);
			resBody.reason = "Request did not contain an order"
		} else if (req.body.order.orderId === undefined) {
			// No orderId - create new order
			try {
				resBody.orderId = await orders.newOrder(req.body.order);
				res.status(200);
			} catch (e) {
				res.status(400);
				resBody.reason = e.toString();
			}
		} else {
			// orderId was provided - update order
			try {
				resBody.orderId = await orders.updateOrder(req.body.order);
				res.status(200);
			} catch (e) {
				res.status(400);
				resBody.reason = e.toString();
			}
		}

		return res.json(buildResponse(resBody));
	});

	// /api/openOrders
	//   Returns order IDs of open orders
	app.post("/api/openOrders", async (req, res) => {
		sh.log("POST /api/openOrders/ from " + req.ip, component, true);

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		// Check access level
		if (!(await checkAccessLevel(sessions, req, res, 0))) return;

		var resBody = {};
		var rows;

		try {
			rows = await orders.getOpenOrders();
		} catch (ex) {
			sh.log("Error: " + ex.toString(), component);
		}

		var orderIds = rows;

		resBody.openOrders = orderIds;
		res.status(200);

		res.json(buildResponse(resBody));
	});

	// /api/unpaidOrders
	//   Returns order IDs of unpaid orders
	app.post("/api/unpaidOrders", async (req, res) => {
		sh.log("POST /api/unpaidOrders/ from " + req.ip, component, true);

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		// Check access level
		if (!(await checkAccessLevel(sessions, req, res, 0))) return;

		var resBody = {};
		var rows;

		try {
			rows = await orders.getUnpaidOrders();
		} catch (ex) {
			sh.log("Error: " + ex.toString(), component);
		}

		var orderIds = rows;

		resBody.unpaidOrders = orderIds;
		res.status(200);

		res.json(buildResponse(resBody));
	});

	// /api/getDishes
	//   Returns dish information based on search parameters
	app.post("/api/getDishes", async (req, res) => {
		sh.log("POST /api/getDishes/ from " + req.ip, component, true);

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		// Check access level
		if (!(await checkAccessLevel(sessions, req, res, 0))) return;

		var searchResults = await dishes.search(req.body);

		return res.json(buildResponse({ results: searchResults }));
	});

	// /api/userDetails
	//   Returns user details givern a userId
	app.post("/api/userDetails", async (req, res) => {
		sh.log("POST /api/userDetails/ from " + req.ip, component, true);

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		// Check access level
		if (!(await checkAccessLevel(sessions, req, res, 0))) return;

		var resBody = {};

		if (!req.body.userId) {
			res.status(400);
			resBody.reason = "No userId was provided";
		} else {
			var details = await auth.userDetails(req.body.userId);
			resBody.user = details;
		}

		res.json(buildResponse(resBody));
	});

	// /api/allUsers
	//   Returns an array of all registered users (sans password)
	app.post("/api/allUsers", async (req, res) => {
		sh.log("POST /api/allUsers/ from " + req.ip, component, true);

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		// Check access level
		if (!(await checkAccessLevel(sessions, req, res, 20))) return;

		var users = await auth.getAllUsers();

		res.json(buildResponse({ allUsers: users }));
	});

	// /api/editUser
	//   Edits a user's record with the given information
	app.post("/api/editUser", async (req, res) => {
		sh.log("POST /api/editUser/ from " + req.ip, component, true);

		// Check client name
		if (!checkAcceptedClient(req, res)) return;

		// Check access level
		if (!(await checkAccessLevel(sessions, req, res, 20))) return;

		var resBody = {};

		if (req.body.user !== undefined) {
			try {
				await auth.updateUser(req.body.user);
			} catch (e) {
				res.status(404);
				resBody.reason = e.toString();
			}
		} else {
			// user was not defined
			res.status(400);
			resBody.reason = "user was not defined in request body";
		}

		res.json(buildResponse(resBody));
	});
}

function checkAccessLevel(sessions, req, res, requiredLevel) {
	return new Promise(async (resolve, cancel) => {
		// Get session id from req
		var sessionId = req.get("sessionId");
		if (!sessionId) {
			// No sessionId was sent. respond with 401 and return false
			res.status(401);
			res.json(buildResponse({ reason: "No sessionId was sent" }));
			resolve(false);
			return;
		}

		// Get access level from database
		var accessLevel;
		try {
			accessLevel = await sessions.getAccessLevel(sessionId);
		} catch (ex) {
			res.status(401);
			res.json(buildResponse({ reason: `Error: ${ex.toString()}` }));
			resolve(false);
			return;
		}

		// Check access level
		if (accessLevel < requiredLevel) {
			res.status(403);
			res.json(buildResponse({ reason: `Access level ${accessLevel} is too low; minimum ${REQD_ACCESSLVL}` }));
			resolve(false);
			return;
		}
		resolve(true);
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