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

		this.relativeUrl = "dishes";
	},

	load: async function () {
		// perform loading operations
		// get list of dishes
		var params = this.readSettings();
		var response = await client.getDishes(params);
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

		// add event handlers
		this.searchbox.oninput = this.boxOnChange.bind(this);
		this.theads.id.onclick = (() => {this.sortTable("dishId");}).bind(this);
		this.theads.name.onclick = (() => {this.sortTable("name");}).bind(this);
		this.theads.price.onclick = (() => {this.sortTable("basePrice");}).bind(this);
		this.theads.category.onclick = (() => {this.sortTable("category");}).bind(this);

		document.getElementById("page-dishes-cover").style.display = "none";
		this.loaded = true;
	},

	boxOnChange: function () {
		var val = this.searchbox.value;
		if (val === "") { this.resetTable(); return; }
		this.searchTable(val);
	},

	sortTable: function (propertyName) {
		var sorted = this.showing.sort((a, b) => { return a[propertyName] > b[propertyName]; });
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

			this.tbody.appendChild(newRow);
		}
	},

	readSettings: function () {
		// TODO make form and read from
		return {};
	}
}