import { Vector3 } from "../math/Vector3.js";
import { getTextureCoords, createAtlas } from "./loadTexture.js";

const register = new Map();

export class Block {
	constructor (id, name, solid, transparent) {
		this.id = id;
		this.name = name;
		this.solid = solid;
		this.transparent = transparent;
		this.textures = {
			top: null,
			bottom: null,
			left: null,
			right: null,
			front: null,
			back: null
		};

		register.set(id, this);
	}
	hasTexture () {
		const t = this.textures;
		return !!(t.top || t.bottom || t.left || t.right || t.back || t.front);
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
		if (!src)
			console.warn(`${this.name} is missing texture ${side}`);
		this.textures[side] = getTextureCoords(src);
	}
	getTexture (side) {
		if (!this.textures[side])
			console.warn(`${this.name} is missing texture ${side}`);
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
	static async parseDefinitions (gl, src) {
		const response = await fetch(src);
		const definitions = await response.json();

		const textures = new Set();
		const callbacks = [];

		const setTexture = (block, side, src) => {
			if (src)
				textures.add(src);
			callbacks.push(() => block.setTexture(side, src));
		};

		for (const def of definitions) {
			const {
				id,
				name,
				solid,
				transparent = false,
				texture,
				side = texture,
				front = side,
				back = side,
				left = side,
				right = side,
				top = texture,
				bottom = top
			} = def;

			if (solid && !(top && bottom && left && right && front && back))
				throw new Error("Undefined texture for block");

			const block = new Block(id, name, solid, transparent);
			if (top)
				setTexture(block, "top", top);
			if (bottom)
				setTexture(block, "bottom", bottom);
			if (left)
				setTexture(block, "left", left);
			if (right)
				setTexture(block, "right", right);
			if (front)
				setTexture(block, "front", front);
			if (back)
				setTexture(block, "back", back);
		}

		const atlas = await createAtlas(gl, textures, 32);

		callbacks.forEach(fn => fn());

		return atlas;
	}
}

Block.FRONT = [
	new Vector3(1, 1, 1),
	new Vector3(0, 1, 1),
	new Vector3(0, 0, 1),
	new Vector3(1, 0, 1),
];
Block.BACK = [
	new Vector3(0, 1, 0),
	new Vector3(1, 1, 0),
	new Vector3(1, 0, 0),
	new Vector3(0, 0, 0),
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
	new Vector3(1, 1, 0),
	new Vector3(1, 1, 1),
	new Vector3(1, 0, 1),
	new Vector3(1, 0, 0),
];
Block.LEFT = [
	new Vector3(0, 1, 1),
	new Vector3(0, 1, 0),
	new Vector3(0, 0, 0),
	new Vector3(0, 0, 1),
];
