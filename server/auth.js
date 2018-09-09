const bcrypt = require("bcrypt");
const ejs = require("ejs");
const uuid = require("uuid/v1");

const component = "auth";

const IncorrectDetailsError = new Error("incorrect username or password");
const UserExistsError = new Error("user already exists");
const UserIdNonexistantError = new Error("User ID does not exist");
const OldPasswordIncorrectError = new Error("The existing password provided was incorrect");

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
		var queryText = "SELECT userId, username, accessLevel, dateAdded FROM users WHERE userId = ?";
		return loginDatabase.get(queryText, userId);
	},

	getAllUsers: function () {
		var queryText = "SELECT userId, username, accessLevel, dateAdded FROM users";
		return loginDatabase.all(queryText);
	},

	updateUser: function (newDetails) {
		// Anything other than accessLevel, username & password will be ignored
		// THIS DOES NOT CHECK PASSWORDS. check em before u reck em
		if (!checkInitiated()) { return; }

		var queryText = "SELECT * FROM users WHERE userId = ?";
		return loginDatabase.get(queryText, newDetails.userId).then(async (existingUser) => {
			if (!existingUser) throw UserIdNonexistantError;

			// Edit fields
			if (newDetails.username !== undefined) {
				existingUser.username = newDetails.username;
			}
			if (newDetails.accessLevel !== undefined) {
				existingUser.accessLevel = newDetails.accessLevel;
			}
			if (newDetails.oldPassword !== undefined && newDetails.newPassword !== undefined) {
				// Password change logic
				var result = await bcrypt.compare(newDetails.oldPassword, existingUser.password);
				if (!result) {
					throw OldPasswordIncorrectError;
				} else {
					existingUser.password = bcrypt.hash(newDetails.newPassword, saltRounds);
				}
			}

			// Set user
			var queryText = "UPDATE users SET username = ?, accessLevel = ?, password = ? WHERE userId = ?";
			var queryVals = [existingUser.username, existingUser.accessLevel, existingUser.password, existingUser.userId];
			return db.run(queryText, queryVals);
		});
	}
}

function checkInitiated() {
	if (!loginDatabase) { 
		sh.logerr("No database found! Call auth.init(db) first", component);
		return false;
	}
	return true;
}