// auth thingo
const bcrypt = require("bcrypt");
const url = require("url");
const bodyParser = require("body-parser");

module.exports = function(app) {
	app.use(bodyParser.urlencoded({ extended: false }));

	app.post("/login", (req, res) => {
		console.log(req.body);
		res.send(req.body);
	});
}