// Component for handling dishes
const component = "dishes";

var db, sh;

module.exports = {
	init: function (database, shlog) {
		db = database;
		sh = shlog;
	},

	search: function (params) {
		checkInitiated();

		var queryText = "SELECT * FROM dishes";
		var values = [];

		if (Object.keys(params) != []) {
			// there are search parameters
			queryText += " WHERE 1 = 1"

			if (params.dishId !== undefined) {
				// add dishId constraint
				queryText += " AND dishId = ?";
				values.push(params.dishId);
			}

			if (params.category !== undefined) {
				// add category constraint
				queryText += " AND category = ? COLLATE NOCASE";
				values.push(params.category);
			}

			if (params.minPrice !== undefined) {
				// add minimum price constraint
				queryText += " AND basePrice >= ?"
				values.push(params.minPrice);
			}

			if (params.maxPrice !== undefined) {
				// add maximum price constraint
				queryText += " AND basePrice <= ?"
				values.push(params.maxPrice);
			}
		}

		// Execute query on database
		return db.all(queryText, values);
	}
}

function checkInitiated () {
	if (!db) throw NotInitiatedError;
	return true;
}