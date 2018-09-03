var homePage = {
	init: function () {
		// set page, tab
		this.page = document.getElementById("page-home");
		this.tab = document.getElementById("tab-home");
		this.relativeUrl = "home";
	},

	load: function () {
		// perform loading operations


		document.getElementById("page-home-cover").style.display = "none";
	}
}