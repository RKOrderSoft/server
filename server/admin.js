// Web server for admin system.
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

		auth.authenticate(req.body.username, req.body.password, (err) => {
			if (err) {
				return res.render("login", { message: err });
			}
			// TODO redir to management interface
			return res.render("login", { message: "Success" });
		});
	});
}