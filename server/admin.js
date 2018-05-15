// Web routes for admin system.
const component = "admin";

module.exports = function (app, auth, sh) {
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
		auth.authenticate(req.body.username, req.body.password, err => {
			if (err) {
				return res.render("login", { message: err });
			}
			// TODO redir to management interface
			return res.render("login", { message: "Success" });
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

		auth.register(req.body.username, req.body.password, req.body.accessLevel, err => {
			if (err) {
				return res.render("register", { message: err });
			}
			return res.render("register", {
				message: "Successfully registered " + req.body.username
			});
		});
	});
}