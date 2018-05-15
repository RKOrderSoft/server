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

	issueSessionId: function (sessionId, ip) {
		if (!checkInitiated()) { return; }
		// TODO
	}
}

function checkInitiated() {
	if (!sessionDatabase) { 
		sh.log("No database found! Call sessions.init(db) first", component);
		return false;
	}
	return true;
}