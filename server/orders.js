// Component for handling order operations
const uuid = require("uuid/v1");

const NotInitiatedError = new Error("Component not initiated; run orders.init(db) first!");
const MissingFieldsError = new Error("Not all required fields were supplied in order");
const ExtraFieldsError = new Error("Unrecognised fields were supplied in order");
const OrderNonexistantError = new Error("Given order ID does not exist in database");

const component = "orders";

const requiredKeys = ["dishes", "orderComplete", "serverId", "tableNumber", "timeSubmitted"];
const allKeys = ["dishes", "orderComplete", "serverId", "timeSubmitted", "tableNumber", "notes", "timeCompleted", "timePaid", "amtPaid"];

var db, sh;

module.exports = {
	init: function (database, shlog) {
		db = database;
		sh = shlog;
	},

	newOrder: function (orderToSubmit) {
		checkInitiated();

		// Check order contains all required keys & no additional keys
		var existingKeys = Object.keys(orderToSubmit);
		var missingKeys = false;
		var extraKeys = false;

		requiredKeys.forEach((el) => {
			if (!existingKeys.includes(el)) {
				missingKeys = true;
			}
		});
		if (missingKeys) throw MissingFieldsError;

		existingKeys.forEach((key) => {
			if (!allKeys.includes(key)) {
				extraKeys = true;
			}
		});
		if (extraKeys) throw ExtraFieldsError;

		// Create new uuid for order id and add time
		orderToSubmit.orderId = uuid();
		var existingKeys = Object.keys(orderToSubmit);

		// Add order to database
		var valsToSubmit = existingKeys.map(key => orderToSubmit[key]);
		var numVals = valsToSubmit.length;
		var queryString = `INSERT INTO orders (${existingKeys.join()}) VALUES (${'?, '.repeat(numVals - 1) + '?'})`;

		return db.run(queryString, valsToSubmit);
	},

	updateOrder: function (toUpdate) {
		checkInitiated();

		// Check that order exists
		var orderId;
		return db.get("SELECT orderId FROM orders WHERE orderId = ?", toUpdate.orderId).then((id) => {
			if (!id) throw OrderNonexistantError;
			orderId = id;
			delete toUpdate.orderId;
			// Check for additional fields
			Object.keys(toUpdate).forEach((key) => {
				if (!allKeys.includes(key)) throw ExtraFieldsError;
			})

			// Construct query
			var updatedKeys = Object.keys(toUpdate);
			var updatedVals = updatedKeys.map(key => toUpdate[key]);
			var queryText = "UPDATE orders SET "
			updatedKeys.forEach((key) => {
				queryText += key + " = ?, "
			});
			queryText += "orderId = orderId "; // dirty fix to remove trailing comma

			queryText += "WHERE orderId = ?";
			updatedVals.push(id.orderId); // Dirty fix to check for id

			return db.run(queryText, updatedVals);
		});

	}
}

function checkInitiated () {
	if (!db) throw NotInitiatedError;
	return true;
}