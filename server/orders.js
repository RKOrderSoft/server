// Component for handling order operations
const uuid = require("uuid/v1");

const NotInitiatedError = new Error("Component not initiated; run orders.init(db) first!");
const MissingFieldsError = new Error("Not all required fields were supplied in order");
const ExtraFieldsError = new Error("Unrecognised fields were supplied in order");
const OrderNonexistantError = new Error("Given order ID does not exist in database");


const component = "orders";

const requiredKeys = ["dishes", "serverId", "tableNumber", "timeSubmitted"];
const allKeys = ["dishes", "serverId", "timeSubmitted", "tableNumber", "notes", "timeCompleted", "timePaid", "amtPaid"];

var db, sh;

module.exports = {
	init: function (database, shlog) {
		db = database;
		sh = shlog;
	},

	getOrder: function (params) {
		if (!params.orderId && !params.tableNumber) {
			return;
		}

		var orderPromise;

		if (params.orderId) {
			// Use order ID
			var orderId = params.orderId;

			var queryString = "SELECT * FROM orders WHERE orderId = ?";
			orderPromise = db.get(queryString, orderId);
		} else {
			// Use table number
			var tableNum = params.tableNumber;

			// Only choose orders that are not yet completed
			var queryString = "SELECT * FROM orders WHERE tableNumber = ? AND timePaid IS NULL AND timeCompleted IS NOT NULL";
			orderPromise = db.get(queryString, tableNum);
		}

		return orderPromise;
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

		return db.run(queryString, valsToSubmit).then(_ => { return orderToSubmit.orderId });
	},

	updateOrder: function (toUpdate) {
		checkInitiated();

		// Check that order exists
		var orderId;
		return db.get("SELECT orderId FROM orders WHERE orderId = ?", toUpdate.orderId).then((id) => {
			if (!id) throw OrderNonexistantError;
			orderId = id.orderId;
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
				queryText += key + " = ?, ";
			});
			queryText += "orderId = orderId "; // dirty fix to remove trailing comma

			queryText += "WHERE orderId = ?";
			updatedVals.push(orderId); // Dirty fix to check for id

			return db.run(queryText, updatedVals).then(_ => { return orderId });
		});
	},

	getOpenOrders: function () {
		checkInitiated();

		/*var queryText = "SELECT orderId FROM orders WHERE timeCompleted IS NULL";
		return db.all(queryText);*/

		return this.searchIds({ isComplete: false });
	},

	getUnpaidOrders: function () {
		checkInitiated();

		/*var queryText = "SELECT orderId FROM orders WHERE timeCompleted IS NOT NULL AND timePaid IS NULL";
		return db.all(queryText);*/

		return this.searchIds({ isComplete: true, isPaid: false });
	},

	searchIds: function (params) {
		checkInitiated();

		var queryText = "SELECT orderId FROM orders"
		var vals = [];

		if (Object.keys(params).length > 0) {
			// Parameters are present
			queryText += " WHERE 1 = 1"

			if (params.isPaid) {
				queryText += " AND timePaid IS NOT NULL";

				if (params.paidAfter) {
					queryText += " AND timePaid > datetime('" + params.paidAfter + "')";
				}

				if (params.paidBefore) {
					queryText += " AND timePaid < datetime('" + params.paidBefore + "')";
				}
			} else {
				queryText += " AND timePaid IS NULL";
				if (!params.isComplete) {
					queryText += " AND timeCompleted IS NULL";
				} else {
					queryText += " AND timeCompleted IS NOT NULL";
				}
			}
		}

		return db.all(queryText).then(results => results.map(val => val.orderId));
	}
}

function checkInitiated () {
	if (!db) throw NotInitiatedError;
	return true;
}