// terrible in-house logging
module.exports = class {
	constructor (verbose=false) {
		this.verbose = verbose;
	}
	log (message, component, verbose=false) {
		if (verbose && !this.verbose) { return; }
		var now = new Date();
		var currentTime = pad(now.getHours()) + ":" + pad(now.getMinutes()) 
			+ ":" + pad(now.getSeconds());
		console.log("[%s] [%s] " + (verbose? "[v] " : "") + "%s", 
			currentTime, component, message);
	}
}

function pad(num) {
	if (num < 10) {
		return "0" + num.toString();
	}
	return num.toString();
}