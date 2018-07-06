// Component to manage API sessions
const uuid = require("uuid/v1");

const component = "sessions";

const SessionIdNonexistantError = new Error("Session ID does not exist in database");
const SessionExpiredError = new Error("Session expired");

var sessionDatabase;

module.exports = {
	init: function (db) { sessionDatabase = db; },

	getAccessLevel: function (sessionId) {
		if (!checkInitiated()) { return; }
		
		const oneDay = new Date();
		var queryText = "SELECT userId, expiryDate FROM sessions WHERE sessionId = ?"

		sessionDatabase.get(queryText, sessionId).then((row) => {

		});
	},

	issueSessionId: function (ip, row) {
		if (!checkInitiated()) { return; }

		var newSessionId = uuid();

		return sessionDatabase.run("INSERT INTO sessions VALUES (?, ?, ?, datetime('now', 'localtime'))", [
			newSessionId,
			ip,
			row.userId
		]).then(_ => {
			return newSessionId;
		});
	}
}

function checkInitiated() {
	if (!sessionDatabase) { 
		sh.logerr("No database found! Call sessions.init(db) first", component);
		return false;
	}
	return true;
}