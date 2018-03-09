// Server for "REST" API requests xd
// I don't even know what REST means tbh
// i think it's one of those buzzwords
const component = "api";

module.exports = function (app, db, sh) {
	app.post("/api/test", (req, res) => {
		if (req.body && req.body.name == "test") {
			return res.json({ works: "yes" });
		}
		return res.json({ works: "nope ya fucked up" });
	})
}