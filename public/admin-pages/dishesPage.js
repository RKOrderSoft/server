var dishesPage = {
	init: function () {
		// set page, tab
		this.page = document.getElementById("page-dishes");
		this.tab = document.getElementById("tab-dishes");
		this.relativeUrl = "dishes";
	},

	load: function () {
		// perform loading operations


		document.getElementById("page-dishes-cover").style.display = "none";
	}
}