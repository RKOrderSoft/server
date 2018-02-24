// auth thingo
const bcrypt = require("bcrypt");
const url = require("url");
const bodyParser = require("body-parser");
const sqlite = require("sqlite3");
const ejs = require("ejs");

module.exports = function(app) {
	app.use(bodyParser.urlencoded({ extended: false }));

	app.route("/login")
		.get((req, res) => {
			res.render("login", { message: "" });
		})
		.post((req, res) => {
			db = new sqlite.Database("data/db.sqlite", () => {
				db.get("SELECT * FROM users WHERE identifier = ?", req.body.identifier, (err, row) => {
					db.close()

					if (err) {
						console.error(err);
						return res.render("login", { message: "Server error: " + err });
					}

					if (row && row.password === req.body.password) {
						return res.render("login", { message: "Success" });
					} 
					return res.render("login", { message: "Incorrect username or password" });
				});
			});
		});

	app.route("/register")
		.get((req, res) => {

		}).post((req, res) => {

		});
}