var state = {  };
var pages, modal, modalCover, help;

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
	modal = document.getElementById("modal-content");
	modalCover = document.getElementById("modal-cover");
	state.modalOpen = false;
	help = document.getElementById("help");

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

	help.onclick = () => {
		toggleModal(true);
	}
	document.getElementById("modal-close").onclick = () => {
		toggleModal(false);
	}
}

function changePage (pageTo) {
	if (state.currentPage !== undefined) {
		// Remove classes
		state.currentPage.page.classList.remove("current-page");
		state.currentPage.tab.classList.remove("selected");
	}

	// Set currentPage
	state.currentPage = pageTo;

	// Add selected classes
	state.currentPage.page.classList.add("current-page");
	state.currentPage.tab.classList.add("selected");
}

function toggleModal (stateTo = undefined) {
	if (typeof(stateTo) === "boolean") {
		if (stateTo) {
			if (state.modalOpen) return;
			
			modal.classList.add("shown");
			modalCover.classList.add("shown");
			state.modalOpen = true;
		} else {
			if (!state.modalOpen) return;

			modal.classList.remove("shown");
			modalCover.classList.remove("shown");
			state.modalOpen = false;
		}
	} else {
		toggleModal(!state.modalOpen);
	}
}