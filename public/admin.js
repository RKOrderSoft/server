var state = {  };
var pages, modal, modalCover, help;

// Client init in an async wrapper function
var client = new orderSoftClient();
async function initClient () {
	// this doesnt really work but there is pretty much no universe in which it
	// doesnt - "pretty much" is good enough for me
	try {
		await client.init(window.location.origin + "/");
		client._sessionID = Cookies.get("ordersoft-sessionId");
	} catch (e) {
		showError(e.toString());
	}
};

window.onload = async function () {
	// Init client
	await initClient();

	// Init pages
	pages = [homePage, ordersPage, dishesPage, settingsPage, usersPage]
	pages.forEach((page) => { page.init(); });

	// Init modal
	modal = document.getElementById("modal");
	modalCover = document.getElementById("modal-cover");
	modalContent = document.getElementById("modal-content");
	state.modalOpen = false;

	// Define help, logout
	help = document.getElementById("help");

	// Check current page
	if (Cookies.get("ordersoft-page")) {
		var pageName = Cookies.get("ordersoft-page");
		Cookies.remove("ordersoft-page", { path: "" });
		pages.forEach((page) => {
			if (pageName == page.relativeUrl) {
				changePage(page);
			}
		});
	} else {
		changePage(homePage);
	}
		
	// Set onclick handlers
	document.getElementById("tab-home").onclick = () => {
		changePage(homePage);
	}
	document.getElementById("tab-users").onclick = () => {
		changePage(usersPage);
	}
	document.getElementById("tab-dishes").onclick = () => {
		changePage(dishesPage);
	}
	document.getElementById("tab-orders").onclick = () => {
		changePage(ordersPage);
	}
	document.getElementById("tab-settings").onclick = () => {
		changePage(settingsPage);
	}

	help.onclick = () => {
		var helpText = document.getElementById("help-text").content.cloneNode(true);
		populateModal([helpText]);
		changeModalTitle("Help");
		toggleModal(true);
	}
	document.getElementById("modal-close").onclick = () => {
		toggleModal(false);
	}
	document.getElementById("logout").onclick = logout;
}

// Helper functions

function changePage (pageTo) {
	if (state.currentPage !== undefined) {
		var pageFrom = state.currentPage;
		// Remove classes
		pageFrom.page.classList.remove("current-page");
		pageFrom.tab.classList.remove("selected");
	}

	// Set currentPage
	state.currentPage = pageTo;

	// Add selected classes
	pageTo.page.classList.add("current-page");
	pageTo.tab.classList.add("selected");

	// Push state
	history.pushState({}, pageTo.relativeUrl, pageTo.relativeUrl);

	// Run init
	if (!state.currentPage.loaded) pageTo.load();
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

function clearModal () {
	while (modalContent.hasChildNodes()) {
		modalContent.removeChild(modalContent.firstChild);
	}
}

function populateModal (elements) {
	clearModal();
	elements.forEach((element) => {
		modalContent.appendChild(element);
	});
}

function changeModalTitle (newTitle) {
	document.getElementById("modal-title").childNodes[0].data = newTitle;
}

function showError(message) {
	// must not call while in a modal
	// TODO
	toggleModal(true);
}

function logout() {
	Cookies.remove("ordersoft-sessionId");
	window.location.replace(window.location.origin + "/login");
}

function dateToString (date) {
	var year = date.getFullYear().toString();
	var month = (date.getMonth() + 1);
	var day = date.getDate();

	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	return year + "-" + pad(month) + "-" + pad(day) + " " + pad(hours) + ":" +
		pad(minutes) + ":" + pad(seconds);
}

function pad (num) {
	if (num < 10) {
    	return "0" + num.toString();
	}
	return num.toString();
}