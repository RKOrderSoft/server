var settingsPage = {
	init: function () {
		// set page, tab
		this.page = document.getElementById("page-settings");
		this.tab = document.getElementById("tab-settings");
		this.relativeUrl = "settings";
	},

	load: function () {
		// perform loading operations


		document.getElementById("page-settings-cover").style.display = "none";
	}
}