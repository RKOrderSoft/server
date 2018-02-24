// auth thingo
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const sqlite = require("sqlite");
const ejs = require("ejs");
const uuid = require("uuid/v1");

module.exports = function(app) {
	app.use(bodyParser.urlencoded({ extended: false }));

	const IncorrectDetailsError = new Error("incorrect username or password");
	const UserExistsError = new Error("user already exists");

	const saltRounds = 10;

	var db;
	sqlite.open("data/db.sqlite")
	.then(opened => {
		db = opened;
	})
	.catch(err => {
		console.error("Error opening database: " + err);
	});

	app.route("/login")
		.get(async (req, res) => {
			return res.render("login", { message: "" });
		})
		.post(async (req, res) => {
			// Check that the POST request is in the format we want, i.e. from /login
			if (!(req.body.password && req.body.identifier)) {
				return res.render("login", { message: "" });
			}

			// Check that the database has opened successfully
			if (!db) {
				return res.render("login", { 
					message: "Error opening database file; try again later" 
				});
			}

			db.get("SELECT password FROM users WHERE identifier = ?", req.body.identifier)
			.then(row => {
				if (!row) { throw IncorrectDetailsError; }
				return bcrypt.compare(req.body.password, row.password);
			})
			.then(result => {
				if (!result) { throw IncorrectDetailsError }
				res.render("login", { message: "Success" });
			})
			.catch(err => {
				res.render("login", { message: err });
			});
		});

	app.route("/register")
		.get(async (req, res) => {
			return res.render("register", { message: "" });
		})
		.post(async (req, res) => {
			// Check the POST request has the data we want
			if (!(req.body.password && req.body.identifier && req.body.accessLevel)) {
				return res.render("register", { message: "" });
			}

			// Check that the database has opened successfully
			if (!db) {
				return res.render("login", { 
					message: "Error opening database file; try again later" 
				});
			}

			db.get("SELECT id FROM users WHERE identifier = ?", req.body.identifier).then(row => {
				if (row) { throw UserExistsError; }
				return bcrypt.hash(req.body.password, saltRounds);
			})
			.then(hashedPw => {
				return db.run("INSERT INTO users VALUES (?, ?, ?, ?, datetime('now'))", [
					uuid(),
					req.body.identifier,
					hashedPw,
					req.body.accessLevel
				]);
			})
			.then(_ => {
				res.render("register", { 
					message: "Successfully registered user " + req.body.identifier 
				});
			})
			.catch(err => {
				res.render("register", { message: err });
			});
		});
}