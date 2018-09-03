var tabState = {  };
var pages;

window.onload = function () {
	pages = {
		home: {
			page: document.getElementById("page-home"),
			tab: document.getElementById("tab-home")
		},
		users: {
			page: document.getElementById("page-users"),
			tab: document.getElementById("tab-users")
		},
		dishes: {
			page: document.getElementById("page-dishes"),
			tab: document.getElementById("tab-dishes")
		},
		orders: {
			page: document.getElementById("page-orders"),
			tab: document.getElementById("tab-orders")
		},
		settings: {
			page: document.getElementById("page-settings"),
			tab: document.getElementById("tab-settings")
		}
	}

	// Set current page to home
	changePage(pages.home);
	// TODO handle coming from other pages

	// Set onclick handlers
	document.getElementById("tab-home").onclick = () => {
		changePage(pages.home);
	}
	document.getElementById("tab-users").onclick = () => {
		changePage(pages.users);
	}
	document.getElementById("tab-dishes").onclick = () => {
		changePage(pages.dishes);
	}
	document.getElementById("tab-orders").onclick = () => {
		changePage(pages.orders);
	}
	document.getElementById("tab-settings").onclick = () => {
		changePage(pages.settings);
	}
}

function changePage (pageTo) {
	if (tabState.currentPage !== undefined) {
		// Remove classes
		tabState.currentPage.page.classList.remove("current-page");
		tabState.currentPage.tab.classList.remove("selected");
	}

	// Set currentPage
	tabState.currentPage = pageTo;

	// Add selected classes
	tabState.currentPage.page.classList.add("current-page");
	tabState.currentPage.tab.classList.add("selected");
}