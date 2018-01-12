export class UserInterface {
	constructor (game) {
		this.element = document.createElement('canvas');
		this.context = this.element.getContext('2d');
		this.element.style.zIndex = 1;
		this.pixelRatio = devicePixelRatio;
		this.width = 0;
		this.height = 0;
		this.game = game;
	}
	updateSize () {
		const w = innerWidth;
		const h = innerHeight;

		if (this.width != w || this.height != h)
			this.setSize(w, h);
	}
	setSize (width, height) {
		const correctedWidth = width * this.pixelRatio;
		const correctedHeight = height * this.pixelRatio;
		const ratio = width / height;
		this.width = width;
		this.height = height;
		this.element.style.width = `${width}px`;
		this.element.style.height = `${height}px`;
		this.element.width = correctedWidth;
		this.element.height = correctedHeight;
	}
	render () {
		if (this.width != innerWidth || this.height != innerHeight)
			this.setSize(innerWidth, innerHeight);
		const width = this.element.width;
		const height = this.element.height;
		const size = 20;
		const halfWidth = width * 0.5;
		const halfHeight = height * 0.5;

		const ctx = this.context;

		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		ctx.lineWidth = 4;
		ctx.moveTo(halfWidth - size, halfHeight);
		ctx.lineTo(halfWidth + size, halfHeight);
		ctx.moveTo(halfWidth, halfHeight - size);
		ctx.lineTo(halfWidth, halfHeight + size);
		ctx.strokeStyle = "white";
		ctx.stroke();
	}
}

class Element {
	constructor () {
		this.position = { x: 0, y: 0 };
		this.size = { x: 0, y: 0 };
	}
	hitTest ({ x, y }) {
		const P = this.position;
		const S = this.size;

		return x > P.x &&
			y > P.y &&
			x < P.x + S.x &&
			y < P.y + S.y;
	}
}
