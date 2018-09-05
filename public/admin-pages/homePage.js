var homePage = {
	init: function () {
		// set page, tab
		this.page = document.getElementById("page-home");
		this.tab = document.getElementById("tab-home");
		this.ipfield = document.getElementById("ip");
		this.relativeUrl = "home";
		this.loaded = false;
	},

	load: function () {
		// perform loading operations
		var ipAddr = window.location.origin + "/";
		ip.appendChild(document.createTextNode(ipAddr));

		document.getElementById("page-home-cover").style.display = "none";
		this.loaded = true;
	}
}