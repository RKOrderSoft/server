var ordersPage = {
	init: function () {
		// set page, tab
		this.page = document.getElementById("page-orders");
		this.tab = document.getElementById("tab-orders");
		this.table = document.getElementById("orders-table-body");

		// table headers
		this.theads = {};
		this.theads.tableNumber = document.getElementById("orders-th-tableNum");
		this.theads.timeSubmitted = document.getElementById("orders-th-timeSub");
		this.theads.timeCom = document.getElementById("orders-th-timeCompleted");
		this.theads.timePaid = document.getElementById("orders-th-timePaid");
		this.theads.amtPaid = document.getElementById("orders-th-amtPaid");

		// form items
		this.filters = {};
		this.filters.completed = document.getElementById("chk-completed");
		this.filters.paid = document.getElementById("chk-paid");
		this.filters.paidAfter = document.getElementById("paidAfter");
		this.filters.paidBefore = document.getElementById("paidBefore");

		this.relativeUrl = "orders";
		this.loaded = false;
	},

	load: async function () {
		// Set initial state
		this.filters.completed.checked = true;
		await this.refreshOrders();

		// add event handlers
		this.filters.completed.oninput = this.refreshOrders.bind(this);
		this.filters.paid.oninput = this.refreshOrders.bind(this);
		this.filters.paidAfter.oninput = this.refreshOrders.bind(this);
		this.filters.paidBefore.oninput = this.refreshOrders.bind(this);

		document.getElementById("page-orders-cover").style.display = "none";
		this.loaded = true;
	},

	clearTable: function () {
		while (this.table.hasChildNodes()) {
			this.table.removeChild(this.table.firstChild);
		}
	},

	refreshOrders: async function () {
		this.clearTable();
		this.verifyForm();

		var openOrderIds = await client.requestFromServer("getOrderIds", this.readFilters(), "POST");
		openOrderIds = openOrderIds.results;

		// get order obj for each order
		var toShow = [];
		for (var i = 0; i < openOrderIds.length; i++) {
			var order = await client.getOrder("orderId", openOrderIds[i]);
			toShow.push(order.order);
		}

		this.populateTable(toShow);
	},

	readFilters: function () {
		var filters = {};

		if (this.filters.completed.checked) {
			filters.isComplete = true;
		} else {
			filters.isComplete = false;
		}

		if (this.filters.paid.checked) {
			filters.isPaid = true;

			if (this.filters.paidAfter.valueAsDate !== null) {
				filters.paidAfter = dateToString(this.filters.paidAfter.valueAsDate);
			}
			if (this.filters.paidBefore.valueAsDate !== null) {
				filters.paidBefore = dateToString(this.filters.paidBefore.valueAsDate);
			}
		} else {
			filters.isPaid = false;
		}

		return filters
	},

	verifyForm: function () {
		// Check checkboxes
		if (this.filters.paid.checked) {
			this.filters.completed.checked = true;
			this.filters.completed.disabled = true;

			this.filters.paidAfter.disabled = false;
			this.filters.paidBefore.disabled = false;
		} else {
			this.filters.completed.disabled = false;

			this.filters.paidAfter.disabled = true;
			this.filters.paidBefore.disabled = true;
		}
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
				newCell.appendChild(document.createTextNode("$" + objects[i].amtPaid.toFixed(2)));
			}
			newRow.appendChild(newCell);

			this.table.appendChild(newRow);
		}
	}
}

function dateToString (date) {
	var year = date.getFullYear().toString();
	var month = (date.getMonth() + 1);
	var day = date.getDate();

	var hours = date.getHours() - 10;
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	return year + "-" + pad(month) + "-" + pad(day) + " " + pad(hours) + ":" +
		pad(minutes) + ":" + pad(seconds);
}

function pad (num) {
	if (num < 10) {
    	return "0" + num.toString();
	}
	return num.toString();
}