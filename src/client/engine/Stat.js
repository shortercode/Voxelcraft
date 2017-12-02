export class Stat {
	constructor (game) {
		this.element = document.createElement("div");
		document.body.appendChild(this.element);
		this.element.style.cssText = "background: white; color: black; width: 50px; height: 20px; font-height: 20px; position: absolute; left: 0; top: 0;";

		let average = null;
		game.on("frame", dt => {
			if (!average) {
				average = dt;
			} else {
				average += (dt - average) * 0.5;
			}
			this.element.textContent = `${Math.round(average)}fps`;
		});
	}
}