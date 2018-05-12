// Server for "REST" API requests xd
// I don't even know what REST means tbh
// i think it's one of those buzzwords
const component = "api";

module.exports = function (app, db, sh) {
	app.post("/api/test", (req, res) => {
		sh.log("POST /api/test/ from " + req.ip, component, true);
		console.log(req.body);
		if (req.body && req.body.name == "test") {
			return res.json({ works: "yes" });
		}
		return res.json({ works: "nope ya fucked up" });
	});
}