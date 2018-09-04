var ordersPage = {
	init: function () {
		// set page, tab
		this.page = document.getElementById("page-orders");
		this.tab = document.getElementById("tab-orders");
		this.table = document.getElementById("orders-table-body");
		this.relativeUrl = "orders";
		this.loaded = false;
	},

	load: async function () {
		// perform loading operations
		console.log(this);
		var openOrderIds = (await client.requestFromServer("unpaidOrders", {}, "POST")).unpaidOrders;

		// get order obj for each open order
		var toShow = [];
		for (var i = 0; i < openOrderIds.length; i++) {
			var order = await client.getOrder("orderId", openOrderIds[i]);
			toShow.push(order.order);
		}

		// populate table
		this.populateTable(toShow);

		document.getElementById("page-orders-cover").style.display = "none";
		this.loaded = true;
	},

	populateTable: function (objects) {
		this.tableShowing = objects;
		
		for (var i = 0; i < objects.length; i++) {
			var newRow = document.createElement("tr");

			// Table number
			var newCell = document.createElement("td");
			newCell.appendChild(document.createTextNode(objects[i].tableNumber.toString()));
			newRow.appendChild(newCell);

			// Time submitted
			var newCell = document.createElement("td");
			newCell.appendChild(document.createTextNode(objects[i].timeSubmitted));
			newRow.appendChild(newCell);

			// Time completed
			var newCell = document.createElement("td");
			if (objects[i].timeCompleted) {
				newCell.appendChild(document.createTextNode(objects[i].timeCompleted));
			}
			newRow.appendChild(newCell);

			// Time paid
			var newCell = document.createElement("td");
			if (objects[i].timePaid) {
				newCell.appendChild(document.createTextNode(objects[i].timePaid));
			}
			newRow.appendChild(newCell);

			// Amount paid
			var newCell = document.createElement("td");
			if (objects[i].amtPaid) {
				newCell.appendChild(document.createTextNode(objects[i].amtPaid.toString()));
			}
			newRow.appendChild(newCell);

			this.table.appendChild(newRow);
		}
	}
}