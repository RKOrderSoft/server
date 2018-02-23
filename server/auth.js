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
			res.sendFile(__dirname + "/../public/index.html");
		})
		.post((req, res) => {

			db = new sqlite.Database("data/db.sqlite");
			db.close();
		});
}