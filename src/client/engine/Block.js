import { Vector3 } from "../math/Vector3.js";
import { getTextureCoords } from "./loadTexture.js";

const register = new Map();

export class Block {
	constructor (id, opaque) {
		this.id = id;
		this.opaque = opaque;
		this.textures = {
			top: getTextureCoords("default"),
			bottom: getTextureCoords("default"),
			left: getTextureCoords("default"),
			right: getTextureCoords("default"),
			front: getTextureCoords("default"),
			back: getTextureCoords("default")
		};

		register.set(id, this);
	}
	setAllTextures (src) {
		const coords = getTextureCoords(src);
		this.textures["top"] = coords;
		this.textures["bottom"] = coords;
		this.textures["left"] = coords;
		this.textures["right"] = coords;
		this.textures["front"] = coords;
		this.textures["back"] = coords;
	}
	setTexture (side, src) {
		this.textures[side] = getTextureCoords(src);
	}
	getTexture (side) {
		return this.textures[side];
	}
	instance () {
		return this;
	}
	destroy (n) {

	}
	static get (id) {
		return register.get(id);
	}
}

Block.FRONT = [
	new Vector3(0, 0, 1),
	new Vector3(1, 0, 1),
	new Vector3(1, 1, 1),
	new Vector3(0, 1, 1),
];
Block.BACK = [
	new Vector3(0, 0, 0),
	new Vector3(0, 1, 0),
	new Vector3(1, 1, 0),
	new Vector3(1, 0, 0),
];
Block.TOP = [
	new Vector3(0, 1, 0),
	new Vector3(0, 1, 1),
	new Vector3(1, 1, 1),
	new Vector3(1, 1, 0),
];
Block.BOTTOM = [
	new Vector3(0, 0, 0),
	new Vector3(1, 0, 0),
	new Vector3(1, 0, 1),
	new Vector3(0, 0, 1),
];
Block.RIGHT = [
	new Vector3(1, 0, 0),
	new Vector3(1, 1, 0),
	new Vector3(1, 1, 1),
	new Vector3(1, 0, 1),
];
Block.LEFT = [
	new Vector3(0, 0, 0),
	new Vector3(0, 0, 1),
	new Vector3(0, 1, 1),
	new Vector3(0, 1, 0)
];
