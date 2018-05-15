// Component to manage API sessions
const uuid = require("uuid/v1");

const component = "sessions";

var sessionDatabase;

module.exports = {
	init: function (db) { sessionDatabase = db; },

	checkSessionId: function (sessionId) {
		if (!checkInitiated()) { return; }
		// TODO
	},

	issueSessionId: function (ip, username) {
		if (!checkInitiated()) { return; }
		// TODO store in database
		var newSessionId = uuid();
		return newSessionId;
	}
}

function checkInitiated() {
	if (!sessionDatabase) { 
		sh.logerr("No database found! Call sessions.init(db) first", component);
		return false;
	}
	return true;
}