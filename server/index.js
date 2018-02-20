const express = require("express");
const path = require("path");

var webApp = new express();

webApp.use(express.static("public"));

var auth = require("./auth.js")(webApp);

webApp.get("*", (req, res) => {
	res.send("page not found");
});

webApp.listen(8080);