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
		this.theads.timeCom = document.getElementById("orders-th-timeCom");
		this.theads.timePaid = document.getElementById("orders-th-timePaid");
		this.theads.amtPaid = document.getElementById("orders-th-amtPaid");

		// form items
		this.filters = {};
		this.filters.completed = document.getElementById("chk-completed");
		this.filters.paid = document.getElementById("chk-paid");
		this.filters.paidAfter = document.getElementById("paidAfter");
		this.filters.paidBefore = document.getElementById("paidBefore");
		this.filters.btnRefresh = document.getElementById("orders-refresh-button");

		this.relativeUrl = "orders";
		this.loaded = false;
	},

	load: async function () {
		// Set initial state
		this.filters.completed.checked = true;
		await this.refreshOrders();

		// add event handlers
		this.filters.completed.onchange = this.refreshOrders.bind(this);
		this.filters.paid.onchange = this.refreshOrders.bind(this);
		this.filters.paidAfter.onchange = this.refreshOrders.bind(this);
		this.filters.paidBefore.onchange = this.refreshOrders.bind(this);

		this.filters.btnRefresh.onclick = this.refreshOrders.bind(this);

		this.theads.tableNumber.onclick = (() => { this.sortTable("tableNumber"); }).bind(this);
		this.theads.timeSubmitted.onclick = (() => { this.sortTable("timeSubmitted"); }).bind(this);
		this.theads.timeCom.onclick = (() => { this.sortTable("timeCompleted"); }).bind(this);
		this.theads.timePaid.onclick = (() => { this.sortTable("timePaid"); }).bind(this);
		this.theads.amtPaid.onclick = (() => { this.sortTable("amtPaid"); }).bind(this);

		document.getElementById("page-orders-cover").style.display = "none";
		this.loaded = true;
	},

	sortTable: function (propName) {
		this.tableShowing.sort((a, b) => { return a[propName] > b[propName]? 1 : -1; });
		this.clearTable();
		this.populateTable(this.tableShowing);
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

			// Add edit handler
			newRow.dataset.orderIndex = i;
			newRow.onclick = function (event) { 
				var idx = this.dataset.orderIndex;
				ordersPage.openEditOrder(idx);
			}

			newRow.title = "Click to edit";
			this.table.appendChild(newRow);
		}
	},

	clearDateTime: function (dateEl, timeEl) {
		dateEl.value = "";
		timeEl.value = "";
	},

	openEditOrder: function (showingIndex) {
		var template = document.getElementById("template-edit-order").content.cloneNode(true);

		// orders is different - showingIndex must be defined
		var thisOrder = this.tableShowing[showingIndex];

		template.querySelector("#order-edit-id").value = thisOrder.orderId;
		template.querySelector("#order-edit-dishes").value = thisOrder.dishes;
		template.querySelector("#order-edit-notes").value = thisOrder.notes;

		// Time submitted
		var timeSubSplit = thisOrder.timeSubmitted.split(" ");
		var dateSub = timeSubSplit[0];
		var timeSub = timeSubSplit[1];
		template.querySelector("#order-edit-sub-date").value = dateSub;
		template.querySelector("#order-edit-sub-time").value = timeSub;

		// Time completed
		if (thisOrder.timeCompleted != undefined) {
			var timeComSplit = thisOrder.timeCompleted.split(" ");
			var dateCom = timeComSplit[0];
			var timeCom = timeComSplit[1];
			template.querySelector("#order-edit-made-date").value = dateCom;
			template.querySelector("#order-edit-made-time").value = timeCom;
		}

		// Time paid
		if (thisOrder.timePaid != undefined) {
			var timePaidSplit = thisOrder.timePaid.split(" ");
			var datePaid = timePaidSplit[0];
			var timePaid = timePaidSplit[1];
			template.querySelector("#order-edit-paid-date").value = datePaid;
			template.querySelector("#order-edit-paid-time").value = timePaid;
		}

		template.querySelector("#order-edit-tableNum").value = thisOrder.tableNumber;
		template.querySelector("#order-edit-amtPaid").value = thisOrder.amtPaid;
		template.querySelector("#order-edit-server").value = thisOrder.serverId;

		// Attach event handlers
		var madeDate = template.querySelector("#order-edit-made-date");
		var madeTime = template.querySelector("#order-edit-made-time");
		var paidDate = template.querySelector("#order-edit-paid-date");
		var paidTime = template.querySelector("#order-edit-paid-time");

		template.querySelector("#order-clear-made").onclick = (() => { 
			this.clearDateTime(madeDate, madeTime);
		}).bind(this);

		template.querySelector("#order-clear-paid").onclick = (() => { 
			this.clearDateTime(paidDate, paidTime);
		}).bind(this);

		template.querySelector("#btn-dish-edit").onclick = (() => {
			this.sendSetOrder();
		}).bind(this);

		// Edit modal
		populateModal([template]);
		changeModalTitle("Edit order");
		toggleModal(true);
	},

	readEditParams: function () {
		var changed = {}
		var form = document.getElementById("order-form");

		// get fields
		changed.orderId = form.querySelector("#order-edit-id").value;
		changed.dishes = form.querySelector("#order-edit-dishes").value;
		changed.notes = form.querySelector("#order-edit-notes").value;
		changed.serverId = form.querySelector("#order-edit-server").value;
		changed.tableNumber = form.querySelector("#order-edit-tableNum").value;
		
		// timeSubmitted
		var subDate = form.querySelector("#order-edit-sub-date").value;
		var subTime = form.querySelector("#order-edit-sub-time").value;
		changed.timeSubmitted = subDate + " " + subTime;

		// timeCompleted
		var madeDate = form.querySelector("#order-edit-made-date").value;
		var madeTime = form.querySelector("#order-edit-made-time").value;
		if (madeDate && madeTime) {
			changed.timeCompleted = madeDate + " " + madeTime;
		} else {
			changed.timeCompleted = null;
		}

		// timePaid
		var paidDate = form.querySelector("#order-edit-paid-date").value;
		var paidTime = form.querySelector("#order-edit-paid-time").value;
		if (paidDate && paidTime) {
			changed.timePaid = paidDate + " " + paidTime;
			changed.amtPaid = form.querySelector("#order-edit-amtPaid").value;
		} else {
			changed.timePaid = null;
			changed.amtPaid = null;
		}

		return changed;
	},

	lockFields: function (locked) {
		var form = document.getElementById("order-form");

		if (locked) {
			form.querySelector("#order-edit-dishes").disabled = true;
			form.querySelector("#order-edit-notes").disabled = true;
			form.querySelector("#order-edit-made-date").disabled = true;
			form.querySelector("#order-edit-made-time").disabled = true;
			form.querySelector("#order-edit-paid-date").disabled = true;
			form.querySelector("#order-edit-paid-time").disabled = true;
			form.querySelector("#order-edit-tableNum").disabled = true;
			form.querySelector("#order-edit-amtPaid").disabled = true;
		} else {
			form.querySelector("#order-edit-dishes").disabled = false;
			form.querySelector("#order-edit-notes").disabled = false;
			form.querySelector("#order-edit-made-date").disabled = false;
			form.querySelector("#order-edit-made-time").disabled = false;
			form.querySelector("#order-edit-paid-date").disabled = false;
			form.querySelector("#order-edit-paid-time").disabled = false;
			form.querySelector("#order-edit-tableNum").disabled = false;
			form.querySelector("#order-edit-amtPaid").disabled = false;
		}
	},

	sendSetOrder: async function () {
		var form = document.getElementById("order-form");
		var errorSpan = form.querySelector(".form-error");

		// lock
		this.lockFields(true);

		var orderDeets = this.readEditParams();

		try {
			await client.requestFromServer("setOrder", {order: orderDeets}, "POST");
			errorSpan.innerHTML = "Update successful";
		} catch (e) {
			errorSpan.innerHTML = "Error updating: " + e.toString();
		}

		// unlock
		this.lockFields(false);

		// refresh
		this.refreshOrders();
	}
}