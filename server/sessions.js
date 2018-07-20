// Component to manage API sessions
const uuid = require("uuid/v1");

const component = "sessions";

const SessionIdNonexistantError = new Error("Session ID does not exist in database");
const SessionExpiredError = new Error("Session expired");

var sessionDatabase;
var auth;

module.exports = {
	init: function (db, authModule) { 
		sessionDatabase = db;
		auth = authModule;
	},

	getAccessLevel: function (sessionId) {
		if (!checkInitiated()) { return; }
		
		var queryText = "SELECT userId, expiryDate FROM sessions WHERE sessionId = ?";

		return sessionDatabase.get(queryText, sessionId).then((row) => {
			if (!row) { throw SessionIdNonexistantError; }

			if (new Date(row.expiryDate) < Date.now()) {
				// sessionId expired
				throw SessionExpiredError;
			}

			// session valid, continue
			return auth.userDetails(row.userId);
		}).then((userRow) => {
			return userRow.accessLevel;
		});
	},

	issueSessionId: function (ip, row) {
		if (!checkInitiated()) { return; }

		var newSessionId = uuid();
		var queryText = "INSERT INTO sessions VALUES (?, ?, ?, datetime('now', '+1 day', 'localtime'))";

		return sessionDatabase.run(queryText, [
			newSessionId,
			ip,
			row.userId
		]).then(_ => {
			return newSessionId;
		});
	}
}

function deleteSession(sessionId) {
	var queryText = "DELETE FROM sessions WHERE sessionId = ?";
	sessionDatabase.run(queryText, sessionId);
}

function checkInitiated() {
	if (!sessionDatabase) { 
		sh.logerr("No database found! Call sessions.init(db) first", component);
		return false;
	}
	return true;
}