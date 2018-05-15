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
		if (!checkInitiated()) { return; }

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

	register: function (username, password, accessLevel, callback) {
		if (!checkInitiated()) { return; }

		loginDatabase.get("SELECT id FROM users WHERE username = ?", username)
		.then(row => {
			if (row) { throw UserExistsError; }
			return bcrypt.hash(password, saltRounds);
		})
		.then(hashedPw => {
			return loginDatabase.run("INSERT INTO users VALUES (?, ?, ?, ?, datetime('now'))", [
				uuid(),
				username,
				hashedPw,
				accessLevel
			]);
		})
		.then(_ => {
			callback(null);
		})
		.catch(err => {
			callback(err);
		});
	}
}

function checkInitiated() {
	if (!loginDatabase) { 
		sh.logerr("No database found! Call sessions.init(db) first", component);
		return false;
	}
	return true;
}