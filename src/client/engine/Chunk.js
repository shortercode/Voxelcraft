import { Entity } from "./Entity.js";
import { Block } from "./Block.js";
import { Vector3 } from "../math/Vector3.js";
import { simplex2 } from "./noise.js";

function noise(x, y, freq) {
	x = freq * x;
	y = freq * y;
	const n = simplex2(x, y)
		+ 0.5 * simplex2(2 * x, 2 * y)
		+ 0.25 * simplex2(4 * x, 4 * y);
		//+ 0.125 * simplex2(x * 8, y  * 8);

	return (n + 1) * 0.5;
}

export class Chunk {
	constructor (gl, width, height, manager) {
		this.manager = manager;
		this.width = width;
		this.area = width ** 2;
		this.height = height;
		this.elements = [];
		this.shouldRender = true;

		const air = Block.get(1);

		for (let i = 0; i < height; i++) {
			const plane = [];
			for (let ii = 0; ii < this.area; ii++) {
				plane.push(air.instance());
			}
			this.elements.push(plane);
		}

		this.entity = new Entity(gl);
	}
	release () {
		this.entity.release();
	}
	setPosition (v) {
		this.entity.setPosition(v);
	}
	getPosition () {
		return this.entity.position;
	}
	generate () {
		const position = this.getPosition();
		const size = this.width;
		const height = this.height;
		const baseline = 50;
		const varience = 20;
		const heightMap = [];

		for (let x = 0; x < size; x++) {
			for (let z = 0; z < size; z++) {
				const xn = position.x + z;
				const yn = position.z + x;
				const y = noise(xn, yn, 0.01);

				const value = baseline + Math.floor(y * varience);
				heightMap.push(value);
			}
		}

		const grass = Block.get(5);
		const dirt = Block.get(2);
		const stone = Block.get(3);
		const air = Block.get(1);

		for (let i = 0; i < height; i++) {
			const plane = this.elements[i];
			for (let ii = 0; ii < this.area; ii++) {
				const value = heightMap[ii];
				if (i > value) {
					plane[ii] = air.instance();
				}
				else if (i == value) {
					plane[ii] = grass.instance();
				}
				else if (i < value) {
					if (i < value - 3) {
						plane[ii] = stone.instance();
					}
					else {
						plane[ii] = dirt.instance();
					}
				}
			}
			this.elements.push(plane);
		}
		this.shouldRender = true;
	}
	render () {
		if (!this.shouldRender)
			return;

		this.shouldRender = false;

		const kx = this.entity.position.x / this.width;
		const kz = this.entity.position.z / this.width;

		const leftChunk = this.manager.get(`${kx - 1}_${kz}`);
		const rightChunk = this.manager.get(`${kx + 1}_${kz}`);
		const frontChunk = this.manager.get(`${kx}_${kz + 1}`);
		const backChunk = this.manager.get(`${kx}_${kz - 1}`);

		// console.time("render");
		const getBlock = (n, x, y) => {
			let plane = this.elements[n];

			if (y < 0) {
				y = this.width + y;
				plane = backChunk && backChunk.elements[n];
			}
			if (x < 0) {
				x = this.width + x;
				plane = leftChunk && leftChunk.elements[n];
			}
			if (x >= this.width) {
				x -= this.width;
				plane = rightChunk && rightChunk.elements[n];
			}
			if (y >= this.width) {
				y -= this.width;
				plane = frontChunk && frontChunk.elements[n];
			}
			if (!plane)
				return null;
			return plane[ y * this.width + x ];
		}

		const faces = [];

		for (let i = 0; i < this.height; i++) {
			for (let x = 0; x < this.width; x++) {
				for (let y = 0; y < this.width; y++) {
					const current = getBlock(i, x, y);
					const top = getBlock(i + 1, x, y);
					const bottom = getBlock(i - 1, x, y);
					const front = getBlock(i, x, y + 1);
					const back = getBlock(i, x, y - 1);
					const left = getBlock(i, x - 1, y);
					const right = getBlock(i, x + 1, y);

					if (!current.opaque)
						continue;

					const positon = [ x, i, y ];
					if (!top || !top.opaque) {
						faces.push([ Block.TOP, positon, current.getTexture("top") ]);
					}
					if (!bottom || !bottom.opaque) {
						faces.push([ Block.BOTTOM, positon, current.getTexture("bottom") ]);
					}
					if (!front || !front.opaque) {
						faces.push([ Block.FRONT, positon, current.getTexture("front") ]);
					}
					if (!back || !back.opaque) {
						faces.push([ Block.BACK, positon, current.getTexture("back") ]);
					}
					if (!left || !left.opaque) {
						faces.push([ Block.LEFT, positon, current.getTexture("left") ]);
					}
					if (!right || !right.opaque) {
						faces.push([ Block.RIGHT, positon, current.getTexture("right") ]);
					}
				}
			}

		}

		const length = faces.length;
		const count = length * 4;
		const vertexArray = new Float32Array(count * 3);
		const textureArray = new Float32Array(count * 2);
		const indexArray = new Uint16Array(length * 6);

		let i = 0;
		let vi = 0;
		let ti = 0;
		let ii = 0;

		for (const face of faces)
		{
			const verticies = face[0];
			const position = face[1];
			const texture = face[2];

			vertexArray[vi++] = verticies[0].x + position[0];
			vertexArray[vi++] = verticies[0].y + position[1];
			vertexArray[vi++] = verticies[0].z + position[2];

			vertexArray[vi++] = verticies[1].x + position[0];
			vertexArray[vi++] = verticies[1].y + position[1];
			vertexArray[vi++] = verticies[1].z + position[2];

			vertexArray[vi++] = verticies[2].x + position[0];
			vertexArray[vi++] = verticies[2].y + position[1];
			vertexArray[vi++] = verticies[2].z + position[2];

			vertexArray[vi++] = verticies[3].x + position[0];
			vertexArray[vi++] = verticies[3].y + position[1];
			vertexArray[vi++] = verticies[3].z + position[2];

			textureArray[ti++] = texture[0];
			textureArray[ti++] = texture[1];

			textureArray[ti++] = texture[2];
			textureArray[ti++] = texture[3];

			textureArray[ti++] = texture[4];
			textureArray[ti++] = texture[5];

			textureArray[ti++] = texture[6];
			textureArray[ti++] = texture[7];

			indexArray[ii++] = i;
			indexArray[ii++] = i + 1;
			indexArray[ii++] = i + 2;
			indexArray[ii++] = i;
			indexArray[ii++] = i + 2;
			indexArray[ii++] = i + 3;

			i += 4;
		}

		this.entity.setVertexBuffer(vertexArray);
		this.entity.setTextureBuffer(textureArray);
		this.entity.setIndexBuffer(indexArray);

		// console.timeEnd	("render");
	}
	save () {
		const length = this.area * this.height;
		const data  = new Uint16Array(length);
		let i = 0;

		for (let y = 0; y < this.height; y++) {
			for (const block of this.elements[y]) {
				data[i++] = block.id;
			}
		}

		return data;
	}
	load (data) {
		let i = 0;
		for (let y = 0; y < this.height; y++) {
			for (let n = 0; n < this.area; n++) {
				const block = Block.get(data[i++]);
				this.elements[y][n] = block.instance();
			}
		}
		this.shouldRender = true;
	}
}
