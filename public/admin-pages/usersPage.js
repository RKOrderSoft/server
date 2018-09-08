var usersPage = {
	init: function () {
		// set page, tab
		this.page = document.getElementById("page-users");
		this.tab = document.getElementById("tab-users");

		this.tbody = document.getElementById("users-table-body");
		this.search = document.getElementById("users-search");

		// Table headers
		this.theads = {};
		this.theads.name = document.getElementById("users-th-name");
		this.theads.access = document.getElementById("users-th-access");
		this.theads.added = document.getElementById("users-th-added");

		this.relativeUrl = "users";
		this.loaded = false;
	},

	load: async function () {
		// perform loading operations
		this.allUsers = (await client.requestFromServer("allUsers", {}, "POST")).allUsers;
		this.populateTable(this.allUsers);

		// fusejs init
		var options = {
			shouldSort: true,
			threshold: 0.3,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 1,
			keys: [
			    "username",
			    "userId"
			]
		};
		this.fuse = new Fuse(this.allUsers, options);

		// event handlers
		this.search.oninput = this.onBoxInput.bind(this);
		this.theads.name.onclick = (() => { this.sort("username"); }).bind(this);
		this.theads.access.onclick = (() => { this.sort("accessLevel"); }).bind(this);
		this.theads.added.onclick = (() => { this.sort("dateAdded"); }).bind(this);

		document.getElementById("page-users-cover").style.display = "none";
		this.loaded = true;
	},

	sort: function (by) {
		this.showing.sort((a, b) => { return a[by] > b[by]? 1 : -1; });
		this.clearTable();
		this.populateTable(this.showing);
	},

	onBoxInput: function () {
		var val = this.search.value;
		if (!val) { 
			this.resetTable(); 
		} else {
			this.searchTable(val);
		}
	},

	resetTable: function () {
		this.clearTable();
		this.populateTable(this.allUsers);
	},

	searchTable: function (query) {
		var items = this.fuse.search(query);
		this.clearTable();
		this.populateTable(items);
	},

	clearTable: function () {
		while (this.tbody.hasChildNodes()) {
			this.tbody.removeChild(this.tbody.firstChild);
		}
	},

	populateTable: function (users) {
		this.showing = users;

		for (var i = 0; i < users.length; i++) {
			var newRow = document.createElement("tr");

			// Username
			var newCell = document.createElement("td");
			newCell.appendChild(document.createTextNode(users[i].username));
			newRow.appendChild(newCell);

			// Access level
			var newCell = document.createElement("td");
			newCell.appendChild(document.createTextNode(users[i].accessLevel.toString()));
			newRow.appendChild(newCell);

			// Date added
			var newCell = document.createElement("td");
			newCell.appendChild(document.createTextNode(users[i].dateAdded));
			newRow.appendChild(newCell);

			newRow.title = "Click to edit";
			this.tbody.appendChild(newRow);
		}
	},

	editUser: function (userToEdit) {
		// Get template
		var editTemplate = document.getElementById("template-edit-user").content.cloneNode(true);

		// Edit data in template
		editTemplate.querySelector("#user-edit-id").value = userToEdit.userId;
		editTemplate.querySelector("#user-edit-name").value = userToEdit.username;
		editTemplate.querySelector("#user-edit-access").value = userToEdit.accessLevel;
		var dateTimeAdded = userToEdit.dateAdded.split(" ");
		editTemplate.querySelector("#user-edit-date").value = dateTimeAdded[0];
		editTemplate.querySelector("#user-edit-time").value = dateTimeAdded[1];

		// Edit modal
		populateModal([editTemplate]);
		changeModalTitle("Edit user");
		toggleModal(true);
	}
}