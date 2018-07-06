const bcrypt = require("bcrypt");
const ejs = require("ejs");
const uuid = require("uuid/v1");

const component = "auth";

const IncorrectDetailsError = new Error("incorrect username or password");
const UserExistsError = new Error("user already exists");
const UserIdNonexistantError = new Error("User ID does not exist");

const saltRounds = 10;

var loginDatabase;

module.exports = {
	init: function (db) { loginDatabase = db; },

	authenticate: function (username, password) {
		if (!checkInitiated()) { return; }

		var userRow;
		var queryText = "SELECT * FROM users WHERE username = ?";

		return loginDatabase.get(queryText, username)
		.then(row => {
			if (!row) { throw IncorrectDetailsError; }
			userRow = row;
			return bcrypt.compare(password, row.password);
		}).then(result => {
			if (!result) { throw IncorrectDetailsError; }
			return userRow;
		})
	},

	register: function (username, password, accessLevel) {
		if (!checkInitiated()) { return; }

		var queryText = "SELECT username FROM users WHERE username = ?";

		return loginDatabase.get(queryText, username)
		.then(row => {
			if (row) { throw UserExistsError; }
			return bcrypt.hash(password, saltRounds);
		}).then(hashedPw => {
			queryText = "INSERT INTO users VALUES (?, ?, ?, ?, datetime('now', 'localtime'))";
			return loginDatabase.run(queryText, [
				uuid(),
				username,
				hashedPw,
				accessLevel
			]);
		});
	},

	userDetails: function (userId) {
		// TODO
	}
}

function checkInitiated() {
	if (!loginDatabase) { 
		sh.logerr("No database found! Call auth.init(db) first", component);
		return false;
	}
	return true;
}