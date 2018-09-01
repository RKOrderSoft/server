const express = require("express");
const sqlite = require("sqlite");
const bodyParser = require("body-parser");
const cors = require("cors");

const shlog = require("./shlog");
const auth = require("./auth.js");
const sessions = require("./sessions.js");
const orders = require("./orders.js");

const component = "index";
const webApp = new express();
const sh = new shlog(true);

// Open db with promise to handle errors
sqlite.open("data/db.sqlite")
.then(opened => {
	sh.log("Database opened", component);
	main(opened);
})

function main (db) {
	// Serve static content
	webApp.use(express.static("public"));
	webApp.set("view engine", "ejs");

	// Use url encoded text from form POST requests
	webApp.use(bodyParser.urlencoded({ extended: false }));
	webApp.use(bodyParser.json());
	webApp.use(cors());

	// Initialise auth, orders & sessions objects
	auth.init(db);
	orders.init(db, sh);
	sessions.init(db, auth);

	// Call components
	var api = require("./api.js")(webApp, db, auth, sessions, orders, sh);
	var admin = require("./admin.js")(webApp, auth, sh);

	// 404 page
	webApp.get("*", (req, res) => {
		sh.log("GET " + req.path + " from " + req.ip, component, true);
		res.status(404).render("404", { page: req.path });
	});

	var server = webApp.listen(8080, () => {
		sh.log("Listening on port 8080", component);
	});
}