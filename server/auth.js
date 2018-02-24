// auth thingo
const bcrypt = require("bcrypt");
const url = require("url");
const bodyParser = require("body-parser");
const sqlite = require("sqlite");
const ejs = require("ejs");

module.exports = function(app) {
	app.use(bodyParser.urlencoded({ extended: false }));

	app.route("/login")
		.get((req, res) => {
			res.render("login", { message: "" });
		})
		.post(async (req, res) => {
			var db = await sqlite.open("data/db.sqlite");

			row = await db.get("SELECT * FROM users WHERE identifier = ?", req.body.identifier);

			db.close()

			if (row && row.password === req.body.password) {
				return res.render("login", { message: "Success" });
			}
			return res.render("login", { message: "Incorrect username or password" });
		});

	app.route("/register")
		.get((req, res) => {

		}).post((req, res) => {

		});
}