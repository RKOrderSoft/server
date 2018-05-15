const bcrypt = require("bcrypt");
const ejs = require("ejs");
const uuid = require("uuid/v1");

const component = "auth";

const IncorrectDetailsError = new Error("incorrect username or password");
const UserExistsError = new Error("user already exists");

const saltRounds = 10;

var loginDatabase;

module.exports = {
	init: function (db) { loginDatabase = db; },
	authenticate: function (username, password, cb) {
		loginDatabase.get("SELECT password FROM users WHERE username = ?", username)
		.then(row => {
			if (!row) { throw IncorrectDetailsError; }
			return bcrypt.compare(password, row.password);
		})
		.then(result => {
			if (!result) { throw IncorrectDetailsError; }
			cb(null);
		})
		.catch(err => {
			cb(err);
		});
	},
	register: function () {

	}
}


function nut (app, db, sh) {
	

	

	// TODO move /register to admin
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

			db.get("SELECT id FROM users WHERE username = ?", req.body.username)
			.then(row => {
				if (row) { throw UserExistsError; }
				return bcrypt.hash(req.body.password, saltRounds);
			})
			.then(hashedPw => {
				return db.run("INSERT INTO users VALUES (?, ?, ?, ?, datetime('now'))", [
					uuid(),
					req.body.username,
					hashedPw,
					req.body.accessLevel
				]);
			})
			.then(_ => {
				res.render("register", { 
					message: "Successfully registered user '" + req.body.username + "'"
				});
			})
			.catch(err => {
				res.render("register", { message: err });
			});
		});

	sh.log("Authentication module started", component);
}