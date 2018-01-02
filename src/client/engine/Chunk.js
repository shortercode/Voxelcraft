import { Entity } from "./Entity.js";
import { Block } from "./Block.js";
import { Vector3 } from "../math/Vector3.js";
import { Noise } from "../math/Noise.js";

const terrainNoise = new Noise();
const bioNoise = new Noise(16);

function randomHeight(x, y, freq) {
	x = freq * x;
	y = freq * y;
	const n = terrainNoise.simplex2(x, y)
		+ 0.25 * terrainNoise.simplex2(2 * x, 2 * y)
		+ 0.125 * terrainNoise.simplex2(4 * x, 4 * y);
		//+ 0.125 * simplex2(x * 8, y  * 8);

	return n / (1 + 0.5 + 0.25);
}

function biomeValue(x, y, freq) {
	x = freq * x;
	y = freq * y;
	return bioNoise.simplex2(x, y);
}

export class Chunk {
	constructor (gl, width, height, manager) {
		this.manager = manager;
		this.width = width;
		this.area = width ** 2;
		this.height = height;
		this.elements = [];

		const air = Block.get(1);

		for (let i = 0; i < height; i++) {
			const plane = [];
			for (let ii = 0; ii < this.area; ii++) {
				plane.push(air.instance());
			}
			this.elements.push(plane);
		}

		this.entity = new Entity(gl);
		this.secondaryEntity = new Entity(gl);
	}
	release () {
		this.entity.release();
		this.secondaryEntity.release();
	}
	setPosition (v) {
		this.entity.setPosition(v);
		this.secondaryEntity.setPosition(v);
	}
	getPosition () {
		return this.entity.position;
	}
	generate () {
		const position = this.getPosition();
		const size = this.width;
		const height = this.height;
		const baseline = 30;
		const varience = 70;
		const heightMap = [];
		const treeMap = [];
		const biomeMap = [];

		const treeBaseline = 0.90;
		const waterHeight = 50;

		for (let x = 0; x < size; x++) {
			for (let z = 0; z < size; z++) {
				const xn = position.x + z;
				const yn = position.z + x;
				const y = randomHeight(xn, yn, 0.01) ** 1.0;

				const blockHeight = baseline + Math.floor(y * varience);
				const treeHeight = biomeValue(xn, yn, 1);
				const biome = biomeValue(xn, yn, 0.01);
				heightMap.push(blockHeight);

				if (biome > 0.2 && treeHeight > treeBaseline) {
					treeMap.push(blockHeight + 3 + 60 * (treeHeight - treeBaseline));
				}
				else {
					treeMap.push(blockHeight);
				}
			}
		}

		const grass = Block.get(5);
		const dirt = Block.get(2);
		const stone = Block.get(3);
		const air = Block.get(1);
		const oak = Block.get(4);
		const water = Block.get(6);
		const sand = Block.get(7);

		for (let i = 0; i < height; i++) {
			const plane = this.elements[i];
			for (let ii = 0; ii < this.area; ii++) {
				const ground = heightMap[ii];
				const tree = treeMap[ii];
				const underWater = ground <= waterHeight;

				if (underWater) {
					if (i > waterHeight) {
						plane[ii] = air.instance();
					}
					else if (i > ground) {
						plane[ii] = water.instance();
					}
					else if (i <= ground) {
						if (i < ground - 3) {
							plane[ii] = stone.instance();
						}
						else {
							plane[ii] = sand.instance();
						}
					}
				}
				else {
					if (i > ground) {
						if (i <= tree) {
							plane[ii] = oak.instance();
						}
						else {
							plane[ii] = air.instance();
						}
					}
					else if (i == ground) {
						plane[ii] = grass.instance();
					}
					else if (i < ground) {
						if (i < ground - 3) {
							plane[ii] = stone.instance();
						}
						else {
							plane[ii] = dirt.instance();
						}
					}
				}
			}
		}
	}
	render () {
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

		const primaryFaces = [];
		const secondaryFaces = [];

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

					if (!current.solid)
						continue;

					const positon = [ x, i, y ];
					//const faces = primaryFaces;
					if (current.transparent) {
						const faces = secondaryFaces;

						if (!top || !top.solid) {
							faces.push([ Block.TOP, positon, current.getTexture("top") ]);
						}
						if (!bottom || !bottom.solid) {
							faces.push([ Block.BOTTOM, positon, current.getTexture("bottom") ]);
						}
						if (!front || !front.solid) {
							faces.push([ Block.FRONT, positon, current.getTexture("front") ]);
						}
						if (!back || !back.solid) {
							faces.push([ Block.BACK, positon, current.getTexture("back") ]);
						}
						if (!left || !left.solid) {
							faces.push([ Block.LEFT, positon, current.getTexture("left") ]);
						}
						if (!right || !right.solid) {
							faces.push([ Block.RIGHT, positon, current.getTexture("right") ]);
						}
					}
					else {
						const faces = primaryFaces;
						if (!top || !top.solid || top.transparent) {
							faces.push([ Block.TOP, positon, current.getTexture("top") ]);
						}
						if (!bottom || !bottom.solid || bottom.transparent) {
							faces.push([ Block.BOTTOM, positon, current.getTexture("bottom") ]);
						}
						if (!front || !front.solid || front.transparent) {
							faces.push([ Block.FRONT, positon, current.getTexture("front") ]);
						}
						if (!back || !back.solid || back.transparent) {
							faces.push([ Block.BACK, positon, current.getTexture("back") ]);
						}
						if (!left || !left.solid || left.transparent) {
							faces.push([ Block.LEFT, positon, current.getTexture("left") ]);
						}
						if (!right || !right.solid || right.transparent) {
							faces.push([ Block.RIGHT, positon, current.getTexture("right") ]);
						}
					}
				}
			}
		}

		this.generateEntity(primaryFaces, this.entity);
		this.generateEntity(secondaryFaces, this.secondaryEntity);
		// console.timeEnd	("render");
	}

	generateEntity (faces, entity) {
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

		entity.setVertexBuffer(vertexArray);
		entity.setTextureBuffer(textureArray);
		entity.setIndexBuffer(indexArray);
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
	}
}
