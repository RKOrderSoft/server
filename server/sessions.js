// Component to manage API sessions
const component = "sessions";

var sessionDatabase;

module.exports = {
	init: function (db) { sessionDatabase = db; },

	checkSessionId: function (SessionId) {
		if (!sessionDatabase) { 
			return sh.log("No database found! Call sessions.init(db) first", component);
		}
	}
}