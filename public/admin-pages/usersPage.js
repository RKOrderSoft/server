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

		this.addBtn = document.getElementById("btn-new-user");

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
		this.addBtn.onclick = (() => { this.openEditUser() }).bind(this);

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

			// Add onclick handlers
			newRow.dataset.dishIndex = i;
			newRow.onclick = (function (event) {
				var index = this.dataset.dishIndex;
				usersPage.openEditUser(index);
			});

			this.tbody.appendChild(newRow);
		}
	},

	openEditUser: function (showingIndex) {
		// Get template
		var editTemplate = document.getElementById("template-edit-user").content.cloneNode(true);

		if (showingIndex !== undefined) {
			var userToEdit = this.showing[showingIndex];

			// Edit data in template
			editTemplate.querySelector("#user-edit-id").value = userToEdit.userId;
			editTemplate.querySelector("#user-edit-name").value = userToEdit.username;
			editTemplate.querySelector("#user-edit-access").value = userToEdit.accessLevel;
			var dateTimeAdded = userToEdit.dateAdded.split(" ");
			editTemplate.querySelector("#user-edit-date").value = dateTimeAdded[0];
			editTemplate.querySelector("#user-edit-time").value = dateTimeAdded[1];
		} else {
			// creating new user
			editTemplate.querySelector("#user-edit-pass-old").disabled = true;
		}

		// Attach event handler
		editTemplate.querySelector("#btn-user-edit").onclick = (() => { this.sendEditUser() }).bind(this);
		editTemplate.querySelector("#btn-user-remove").onclick = (() => { this.removeUser(); }).bind(this);

		// Edit modal
		populateModal([editTemplate]);
		changeModalTitle("Edit user");
		toggleModal(true);
	},

	readEditParams: function () {
		// Get fields
		var fields = {};
		var form = document.getElementById("user-form");

		fields.userId = form.querySelector("#user-edit-id").value;
		if (!fields.userId) {
			delete fields.userId;
		}

		fields.username = form.querySelector("#user-edit-name").value;
		fields.accessLevel = form.querySelector("#user-edit-access").value;

		fields.oldPassword = form.querySelector("#user-edit-pass-old").value;
		fields.newPassword = form.querySelector("#user-edit-pass-new").value;
		
		if (!fields.newPassword) {
			delete fields.oldPassword;
			delete fields.newPassword;
		}

		return fields;
	},

	sendEditUser: async function () {
		var form = document.getElementById("user-form");

		// Lock fields
		this.lockFields(true);

		// Get params
		var userChanges = this.readEditParams();

		if (userChanges.userId !== undefined) {
			// userId exists, editing
			// Send to server
			try {
				await client.requestFromServer("editUser", {user: userChanges}, "POST");
				form.querySelector(".form-error").innerHTML = "Edit success";
			} catch (e) {
				form.querySelector(".form-error").innerHTML = "Error: " + e.toString();
			}
		} else {
			// registering
			userChanges.password = userChanges.newPassword;
			try {
				await client.requestFromServer("registerUSer", {user: userChanges}, "POST");
				form.querySelector(".form-error").innerHTML = "Register success";
			} catch (e) {
				form.querySelector(".form-error").innerHTML = "Error: " + e.toString();
			}
		}

		this.lockFields(false);
	},

	removeUser: async function () {
		// Removes currently open user
		this.lockFields(true);

		var form = document.getElementById("user-form");
		var user = this.readEditParams();

		// delete user
		try {
			await client.requestFromServer("removeUser", {userId: user.userId}, "POST");
			form.querySelector(".form-error").innerHTML = "Deleted successfully";
		} catch (e) {
			form.querySelector(".form-error").innerHTML = "Error deleting: " + e.toString();
		}
	},

	lockFields: function (locked) {
		var form = document.getElementById("user-form");

		if (locked) {
			form.querySelector("#user-edit-access").disabled = true;
			form.querySelector("#user-edit-name").disabled = true;
			form.querySelector("#user-edit-pass-old").disabled = true;
			form.querySelector("#user-edit-pass-new").disabled = true;
		} else {
			// Unlock fields
			form.querySelector("#user-edit-access").disabled = false;
			form.querySelector("#user-edit-name").disabled = false;
			form.querySelector("#user-edit-pass-old").disabled = false;
			form.querySelector("#user-edit-pass-new").disabled = false;
		}
	}
}