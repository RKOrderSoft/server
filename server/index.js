const express = require("express");
const sqlite = require("sqlite");
const shlog = require("./shlog");
const bodyParser = require("body-parser");
const cors = require("cors");

const component = "index";
const webApp = new express();
const sh = new shlog(true);

// Open db with promise to handle errors
sqlite.open("data/db.sqlite")
.then(opened => {
	sh.log("Database opened", component);
	main(opened);
})
.catch(err => {
	sh.logerr("Error opening database: " + err, component);
});

function main(db) {
	// Serve static content
	webApp.use(express.static("public"));
	webApp.set("view engine", "ejs");

	// Use url encoded text from form POST requests
	webApp.use(bodyParser.urlencoded({ extended: false }));
	webApp.use(bodyParser.json());
	webApp.use(cors());

	// Get auth & sessions objects
	const auth = require("./auth.js");
	auth.init(db);

	const sessions = require("./sessions.js");
	sessions.init(db);

	// Call components
	var api = require("./api.js")(webApp, db, auth, sessions, sh);
	var realtime = require("./realtime.js")(sh);
	var admin = require("./admin.js")(webApp, auth, sh);

	// 404 page
	webApp.get("*", (req, res) => {
		sh.log("GET " + req.path + " from " + req.ip, component, true);
		res.render("404", { page: req.path });
	});

	webApp.listen(8080, () => {
		sh.log("Listening on port 8080", component);
	});
}