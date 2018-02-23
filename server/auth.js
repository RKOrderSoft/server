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
			console.log("nut");
			db = new sqlite.Database("data/db.sqlite");

			db.close();

			res.render("login", { message: "Incorrect username or password." });
		});
}