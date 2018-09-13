// Component for handling dishes
const component = "dishes";

const allowedKeys = ["name", "basePrice", "upgradePrice", "sizes", "category", "image", "description"];

const ExtraKeysError = new Error("Additional keys were present");
const InvalidValueError = new Error("Invalid values were supplied");

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
	},

	getCategories: function () {
		if (!checkInitiated()) return;

		return db.all("SELECT DISTINCT category FROM dishes").then((rows) => {
			return rows.map(row => row.category);
		});
	},

	removeDish: function (idToRemove) {
		if (!checkInitiated()) return;

		var queryText = "DELETE FROM dishes WHERE dishId = ?";
		return db.run(queryText, idToRemove);
	},

	createDish: function (dishObj) {
		if (!checkInitiated()) return;

		var queryText = "SELECT MAX(dishId) FROM dishes";

		return db.get(queryText).then((row) => {
			// row.dishId contains the largest dishId
			var highestId = row["MAX(dishId)"];
			dishObj.dishId = parseInt(highestId) + 1;

			// data validation
			if (dishObj.basePrice < 0 || dishObj.upgradePrice < 0) {
				throw InvalidValueError;
			}

			var queryText = "INSERT INTO dishes (dishId, name, basePrice, upgradePrice, sizes, category, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
			return db.run(queryText, [
				dishObj.dishId, 
				dishObj.name, 
				dishObj.basePrice, 
				dishObj.upgradePrice, 
				dishObj.sizes, 
				dishObj.category,
				dishObj.image, 
				dishObj.description]);
		})
		
	},

	updateDish: function (dishObj) {
		if (!checkInitiated()) return;

		if (dishObj.dishId === undefined) {
			throw new Error("no dishId provided");
		}

		var keys = Object.keys(dishObj);
		var keysToSet = [];
		var valsToSet = [];

		for (var i = 0; i < keys.length; i++) {
			if (keys[i] === "dishId") { continue; }

			if (keys.indexOf(keys[i]) < 0) {
				throw ExtraKeysError;
			} else {
				keysToSet.push(keys[i]);
				valsToSet.push(dishObj[keys[i]]);
			}

			if (keys[i] == "basePrice" || keys[i] == "upgradePrice") {
				if (dishObj[keys[i]] < 0) {
					throw InvalidValueError;
				}
			}
		}

		// add " = ?" to vals
		keysToSet = keysToSet.map(key => key + " = ?");

		// construct query string
		var queryText = `UPDATE dishes SET ${keysToSet.join(", ")} WHERE dishId = ?`
		valsToSet.push(dishObj.dishId);

		return db.run(queryText, valsToSet);
	}
}

function checkInitiated () {
	if (!db) throw NotInitiatedError;
	return true;
}