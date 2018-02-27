const express = require("express");
const sqlite = require("sqlite");

var webApp = new express();

// Open db with promise to handle errors
var db;
sqlite.open("data/db.sqlite")
.then(opened => {
	db = opened;
})
.catch(err => {
	console.error("Error opening database: " + err);
});

// Serve static content
webApp.use(express.static("public"));
webApp.set("view engine", "ejs");

// Call components
var auth = require("./auth.js")(webApp, db);
var api = require("./api.js")(webApp, db);

// 404 page
webApp.get("*", (req, res) => {
	res.render("404", { page: req.path });
});

webApp.listen(8080, () => {
	console.log("HTTP server started at port 8080");
});