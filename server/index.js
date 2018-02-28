const express = require("express");
const sqlite = require("sqlite");

var webApp = new express();

// Open db with promise to handle errors
var db;
sqlite.open("data/db.sqlite")
.then(opened => {
	console.log("db opened");
	db = opened;
	init(webApp, db);
})
.catch(err => {
	console.error("Error opening database: " + err);
});

function init(webApp, db) {
	// Serve static content
	webApp.use(express.static("public"));
	webApp.set("view engine", "ejs");

	// Call components
	var auth = require("./auth.js")(webApp, db);
	var api = require("./api.js")(webApp, db);
	var realtime = require("./realtime.js")();

	// 404 page
	webApp.get("*", (req, res) => {
		res.render("404", { page: req.path });
	});

	webApp.listen(8080, () => {
		console.log("HTTP server started at port 8080");
	});
}