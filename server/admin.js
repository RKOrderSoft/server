// Web routes for admin system.
const component = "admin";
const requiredAccessLvl = 20;

module.exports = function (app, auth, sessions, sh) {
	app.route("/login")
	.get(async (req, res) => {
		sh.log("GET /login from " + req.ip, component, true);
		return res.render("login", { message: "" });
	})
	.post(async (req, res) => {
		sh.log("POST /login from " + req.ip, component, true);
		// Check that the POST request contains the correct data
		if (!(req.body.password && req.body.username)) {
			return res.render("login", { message: "Please enter a username and password" });
		}
		auth.authenticate(req.body.username, req.body.password).then(row => {
			// Check access level
			if (row.accessLevel < requiredAccessLvl) {
				return res.render("login", { message: "Permission denied: access level too low" });
			}

			// Issue session ID
			return sessions.issueSessionId(req.ip, row);
		}).then((newSessionId) => {
			res.set("Set-Cookie", "ordersoft-sessionId=" + encodeURI(newSessionId));

			// Redirect to admin interface
			res.redirect("/admin/home");
		}).catch(err => {
			return res.render("login", { message: err });
		});
	});

	app.route("/register")
	.get(async (req, res) => {
		sh.log("GET /register from " + req.ip, component, true);
		return res.render("register", { message: "" });
	})
	.post(async (req, res) => {
		sh.log("POST /register from " + req.ip, component, true);
		// Check the POST request has the data we want
		if (!(req.body.password && req.body.username && req.body.accessLevel)) {
			return res.render("register", { message: "" });
		}

		auth.register(req.body.username, req.body.password, req.body.accessLevel)
		.then(_ => {
			return res.render("register", {
				message: "Successfully registered " + req.body.username
			});
		}).catch(err => {
			return res.render("register", { message: err });
		});
	});

	app.get("/admin", async (req, res) => {
		sh.log("GET /admin from " + req.ip, component, true);
		res.redirect("/admin/home");
	});

	app.route("/admin/home")
	.get(async (req, res) => {
		sh.log("GET /admin/home from " + req.ip, component, true);

		// Check accessLevel
		var sessionId = req.cookies["ordersoft-sessionId"];
		if (sessionId === undefined) { return res.redirect("/login"); }

		var accessLevel;

		try {
			accessLevel = await sessions.getAccessLevel(sessionId);
		} catch (e) {
			return res.redirect("/login");
		}

		if (accessLevel < requiredAccessLvl) {
			return res.redirect("/login");
		}

		// Render page
		return res.render("admin");
	});

	app.get("/admin/orders", async (req, res) => {
		sh.log("GET /admin/orders from " + req.ip, component, true);

		res.set("Set-Cookie", "ordersoft-page=orders");
		res.redirect("/admin/home");
	});

	app.get("/admin/dishes", async (req, res) => {
		sh.log("GET /admin/dishes from " + req.ip, component, true);
		
		res.set("Set-Cookie", "ordersoft-page=dishes");
		res.redirect("/admin/home");
	});

	app.get("/admin/users", async (req, res) => {
		sh.log("GET /admin/users from " + req.ip, component, true);
		
		res.set("Set-Cookie", "ordersoft-page=users");
		res.redirect("/admin/home");
	});

	app.get("/admin/settings", async (req, res) => {
		sh.log("GET /admin/settings from " + req.ip, component, true);
		
		res.set("Set-Cookie", "ordersoft-page=settings");
		res.redirect("/admin/home");
	});
}