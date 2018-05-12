const express = require("express");
const sqlite = require("sqlite");
const shlog = require("./shlog");
const bodyParser = require("body-parser");
const cors = require("cors");

const component = "index";
const webApp = new express();
const sh = new shlog(true);

// Open db with promise to handle errors
var db;
sqlite.open("data/db.sqlite")
.then(opened => {
	sh.log("Database opened", component);
	db = opened;
	main(db);
})
.catch(err => {
	console.error("Error opening database: " + err);
});

function main(db) {
	// Serve static content
	webApp.use(express.static("public"));
	webApp.set("view engine", "ejs");

	// Use url encoded text from form POST requests
	webApp.use(bodyParser.urlencoded({ extended: false }));
	webApp.use(cors());

	// Call components
	var auth = require("./auth.js")(webApp, db, sh);
	var api = require("./api.js")(webApp, db, sh);
	var realtime = require("./realtime.js")(sh);

	// 404 page
	webApp.get("*", (req, res) => {
		sh.log("GET " + req.path + " from " + req.ip, component, true);
		res.render("404", { page: req.path });
	});

	webApp.listen(8080, () => {
		sh.log("Listening on port 8080", component);
	});
}