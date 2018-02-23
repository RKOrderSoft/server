const express = require("express");
const path = require("path");

var webApp = new express();

// Serve static content
webApp.use(express.static("public"));
webApp.set("view engine", "ejs");

var auth = require("./auth.js")(webApp);

// 404 page
webApp.get("*", (req, res) => {
	res.send("page not found");
});

webApp.listen(8080);