var dishesPage = {
	init: function () {
		// set page, tab
		this.page = document.getElementById("page-dishes");
		this.tab = document.getElementById("tab-dishes");
		this.tbody = document.getElementById("dishes-table-body");
		this.searchbox = document.getElementById("dishes-search");
		
		// Table headers
		this.theads = {};
		this.theads.id = document.getElementById("dishes-th-id");
		this.theads.name = document.getElementById("dishes-th-name");
		this.theads.price = document.getElementById("dishes-th-price");
		this.theads.category = document.getElementById("dishes-th-cat");

		this.btnRefresh = document.getElementById("btn-dishes-refresh");
		this.btnNew = document.getElementById("btn-new-dish");

		this.radioAscending = document.getElementById("dishes-sort-asc");

		this.relativeUrl = "dishes";
	},

	load: async function () {
		// perform loading operations
		await this.refreshTable();

		// add event handlers
		this.searchbox.oninput = this.boxOnChange.bind(this);
		this.theads.id.onclick = (() => {this.sortTable("dishId");}).bind(this);
		this.theads.name.onclick = (() => {this.sortTable("name");}).bind(this);
		this.theads.price.onclick = (() => {this.sortTable("basePrice");}).bind(this);
		this.theads.category.onclick = (() => {this.sortTable("category");}).bind(this);
		this.btnRefresh.onclick = (() => { this.refreshTable() }).bind(this);
		this.btnNew.onclick = (() => { this.openEditDish() }).bind(this);

		document.getElementById("page-dishes-cover").style.display = "none";
		this.loaded = true;
	},

	refreshTable: async function () {
		// get list of dishes
		var response = await client.getDishes({});
		this.dishes = response.results;

		// show on table
		this.resetTable();

		// fusejs init
		var options = {
			shouldSort: true,
			threshold: 0.3,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 1,
			keys: [
			    "name",
			    "category"
			]
		};
		this.fuse = new Fuse(this.dishes, options);
	},

	boxOnChange: function () {
		var val = this.searchbox.value;
		if (val === "") { this.resetTable(); return; }
		this.searchTable(val);
	},

	sortTable: function (propertyName) {
		if (this.radioAscending.checked) {
			// ascending
			var sorted = this.showing.sort((a, b) => { return a[propertyName] > b[propertyName]? 1 : -1; });
		} else {
			// descending
			var sorted = this.showing.sort((a, b) => { return a[propertyName] < b[propertyName]? 1 : -1; });
		}
		this.clearTable();
		this.populateTable(sorted);
	},

	searchTable: function (term) {
		var items = this.fuse.search(term);
		this.clearTable();
		this.populateTable(items);
	},

	clearTable: function () {
		while (this.tbody.hasChildNodes()) {
			this.tbody.removeChild(this.tbody.firstChild);
		}
	},

	resetTable: function () {
		this.clearTable();
		this.populateTable(this.dishes);
	},

	populateTable: function (dishes) {
		this.showing = JSON.parse(JSON.stringify(dishes));
		for (var i = 0; i < dishes.length; i++) {
			var newRow = document.createElement("tr");

			// Dish ID
			var newCell = document.createElement("td");
			newCell.appendChild(document.createTextNode(dishes[i].dishId));
			newRow.appendChild(newCell);

			// Dish name
			var newCell = document.createElement("td");
			newCell.appendChild(document.createTextNode(dishes[i].name));
			newRow.appendChild(newCell);

			// Base price
			var newCell = document.createElement("td");
			newCell.appendChild(document.createTextNode("$" + 
				dishes[i].basePrice.toFixed(2)));
			newRow.appendChild(newCell);

			// Category
			var newCell = document.createElement("td");
			newCell.appendChild(document.createTextNode(dishes[i].category));
			newRow.appendChild(newCell);

			// Add onclick handler
			newRow.dataset.dishIndex = i;
			newRow.onclick = function (event) {
				var index = this.dataset.dishIndex;
				dishesPage.openEditDish(index);
			}

			newRow.title = "Click to edit";
			this.tbody.appendChild(newRow);
		}
	},

	openEditDish: function (showingIndex) {
		var template = document.getElementById("template-edit-dish").content.cloneNode(true);

		if (showingIndex !== undefined) {
			// Editing dish
			var editing = this.showing[showingIndex];

			// Edit data in template
			template.querySelector("#dish-edit-id").value = editing.dishId;
			template.querySelector("#dish-edit-name").value = editing.name;
			template.querySelector("#dish-edit-basePrice").value = editing.basePrice;
			template.querySelector("#dish-edit-upgPrice").value = editing.upgradePrice;
			template.querySelector("#dish-edit-cat").value = editing.category;
			template.querySelector("#dish-edit-sizes").value = editing.sizes;
			template.querySelector("#dish-edit-desc").value = editing.description;
			template.querySelector("#dish-edit-img").value = editing.image;
		}

		// Attach event handlers
		template.querySelector("#btn-dish-edit").onclick = (() => { this.sendSetDish() }).bind(this);
		template.querySelector("#btn-dish-remove").onclick = (() => { this.removeDish() }).bind(this);

		// Edit modal
		populateModal([template]);
		changeModalTitle("Edit dish");
		toggleModal(true);
	},

	readEditParams: function () {
		var newDish = {};
		var form = document.getElementById("dish-form");

		// populate newDish
		newDish.dishId = form.querySelector("#dish-edit-id").value;
		newDish.name = form.querySelector("#dish-edit-name").value;
		newDish.basePrice = form.querySelector("#dish-edit-basePrice").value;
		newDish.upgradePrice = form.querySelector("#dish-edit-upgPrice").value;
		newDish.category = form.querySelector("#dish-edit-cat").value;
		newDish.sizes = form.querySelector("#dish-edit-sizes").value;
		newDish.description = form.querySelector("#dish-edit-desc").value;
		newDish.image = form.querySelector("#dish-edit-img").value;

		// Remove null fields
		var keys = Object.keys(newDish);
		keys.forEach((key) => {
			if (newDish[key] == "") {
				// the above is intentionally non-strict
				delete newDish[key]
			}
		});

		return newDish;
	},

	lockFields: function (locked) {
		var form = document.getElementById("dish-form");

		if (locked) {
			form.querySelector("#dish-edit-name").disabled = true;
			form.querySelector("#dish-edit-basePrice").disabled = true;
			form.querySelector("#dish-edit-upgPrice").disabled = true;
			form.querySelector("#dish-edit-cat").disabled = true;
			form.querySelector("#dish-edit-sizes").disabled = true;
			form.querySelector("#dish-edit-desc").disabled = true;
			form.querySelector("#dish-edit-img").disabled = true;
		} else {
			form.querySelector("#dish-edit-name").disabled = false;
			form.querySelector("#dish-edit-basePrice").disabled = false;
			form.querySelector("#dish-edit-upgPrice").disabled = false;
			form.querySelector("#dish-edit-cat").disabled = false;
			form.querySelector("#dish-edit-sizes").disabled = false;
			form.querySelector("#dish-edit-desc").disabled = false;
			form.querySelector("#dish-edit-img").disabled = false;
		}
	},

	sendSetDish: async function () {
		var form = document.getElementById("dish-form");
		var errorSpan = form.querySelector(".form-error");
		errorSpan.innerHTML = "";

		// Lock form while sending
		this.lockFields(true);

		// Get obj
		var newDish = this.readEditParams();

		// Send to server
		try {
			await client.requestFromServer("setDish", {dish: newDish}, "POST");
			errorSpan.innerHTML = "Edit success";
		} catch (e) {
			errorSpan.innerHTML = "Error: " + e.toString();
		}

		// Refresh dishes
		this.refreshTable();

		// Unlock form
		this.lockFields(false);
	},

	removeDish: async function () {
		var form = document.getElementById("dish-form");
		var errorSpan = form.querySelector(".form-error");
		errorSpan.innerHTML = "";
		// Lock fields
		this.lockFields(true);

		var dish = this.readEditParams();
		var idToDelete = dish.dishId;

		// Send req to server
		try {
			await client.requestFromServer("removeDish", {dishId: idToDelete}, "POST");
			errorSpan.innerHTML = "Delete success";
		} catch (e) {
			errorSpan.innerHTML = "Error deleting: " + e.toString();
		}

		this.refreshTable();
	}
}