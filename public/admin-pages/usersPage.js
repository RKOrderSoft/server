var usersPage = {
	init: function () {
		// set page, tab
		this.page = document.getElementById("page-users");
		this.tab = document.getElementById("tab-users");
		this.relativeUrl = "users";
	},

	load: function () {
		// perform loading operations


		document.getElementById("page-users-cover").style.display = "none";
	}
}