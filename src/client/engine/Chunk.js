import { Entity } from "./Entity.js";
import { Block } from "./Block.js";
import { Vector3 } from "../math/Vector3.js";
import { Noise } from "../math/Noise.js";

const terrainNoise = new Noise();
const bioNoise = new Noise(16);

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
		this.secondaryEntity.transparent = true;
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
	setBlockAt (x, y, z, block) {
		const plane = this.elements[y];
		const w = this.width;
		const xn = Math.floor(x / w);
		const zn = Math.floor(z / w);

		x = x % w;
		z = z % w;
		x = x < 0 ? x + w : x;
		z = z < 0 ? z + w : z;

		const n = z * w + x;
		if (n < plane.length && n > -1)
		{
			plane[n] = block.instance();
			this.render();
			if (x === 0) {
				const neighbour = this.manager.get(`${xn - 1}_${zn}`);
				neighbour && neighbour.render();
			} else if (x === this.width - 1) {
				const neighbour = this.manager.get(`${xn + 1}_${zn}`);
				neighbour && neighbour.render();
			}

			if (z === 0) {
				const neighbour = this.manager.get(`${xn}_${zn - 1}`);
				neighbour && neighbour.render();
			} else if (z === this.width - 1) {
				const neighbour = this.manager.get(`${xn}_${zn + 1}`);
				neighbour && neighbour.render();
			}
		}
	}
	generate () {
		const position = this.getPosition();
		const size = this.width;
		const height = this.height;
		const baseline = 20;
		const varience = 80;
		const heightMap = [];
		const treeMap = [];
		const biomeMap = [];
		const leafMap = new Array(size * size);
		const treeBaseline = 0.95;
		const waterHeight = 50;
		const kx = position.x / this.width;
		const kz = position.z / this.width;

		const currentChunk = this.manager.createChunkLeafData(kx, kz);
		const leftChunk = this.manager.createChunkLeafData(kx - 1, kz);
		const rightChunk = this.manager.createChunkLeafData(kx + 1, kz);
		const frontChunk = this.manager.createChunkLeafData(kx, kz + 1);
		const backChunk = this.manager.createChunkLeafData(kx, kz - 1);

		const frontleftChunk = this.manager.createChunkLeafData(kx - 1, kz + 1);
		const backrightChunk = this.manager.createChunkLeafData(kx + 1, kz - 1);
		const frontrightChunk = this.manager.createChunkLeafData(kx + 1, kz + 1);
		const backleftChunk = this.manager.createChunkLeafData(kx - 1, kz - 1);

		const addLeaves = (xn, yn, h, r) => {
			const rr = r ** 2;
			const low = h - r;
			const high = h + r;
			for (let y = low; y < high; y++) {
				for (let x = 0, i = 0; x < size; x++) {

					let chunk = null;
					let xmod = 0;
					let ymod = 0;
					if (y < 0) {
						ymod -= size;
						if (x < 0) {
							chunk = backleftChunk;
							xmod += size;
						} else if (x >= size) {
							chunk = backrightChunk;
							xmod -= size;
						} else
							chunk = backChunk;
					} else if (y >= size) {
						ymod += size;
						if (x < 0) {
							chunk = frontleftChunk;
							xmod += size;
						} else if (x >= size) {
							chunk = frontrightChunk;
							xmod -= size;
						} else
							chunk = frontChunk;
					} else {
						if (x < 0) {
							chunk = leftChunk;
							xmod += size;
						} else if (x >= size) {
							chunk = rightChunk;
							xmod -= size;
						} else
							chunk = backChunk;
					}

					for (let z = 0; z < size; z++, i++) {
						const d = ((xn - x) ** 2) + ((yn - z) ** 2) + ((h - y) ** 2);
						if (d < rr) {
							let arr = leafMap[i];
							if (!arr)
								arr = leafMap[i] = new Set();
							arr.add(y);
						}
					}
				}
			}
		};

		const treenoise = terrainNoise.simplex2FBMTexture(position.x, position.z, size, size, 4, 10);
		const getTreeValue = (x, y) => {
			const column = treenoise[x];
			return column ? (column[y] || 0) : 0;
		}
		for (let x = 0, i = 0; x < size; x++) {
			for (let z = 0; z < size; z++, i++) {
				const xn = position.x + z;
				const yn = position.z + x;
				const y = terrainNoise.simplex2FBM(xn, yn, 6, 0.001);

				const blockHeight = baseline + Math.floor(y * varience);
			//	const treeHeight = biomeValue(xn, yn, 1);
				const biome = bioNoise.simplex2FBM(xn, yn, 6, 0.001); //biomeValue(xn, yn, 0.01);
				heightMap.push(blockHeight);

				const R = Math.floor(biome * 8 + 3);
				let max = 0;
				if (R < 6) {
				    // there are more efficient algorithms than this
				    for (let xc = x - R; xc <= x + R; xc++) {
				      for (let zc = z - R; zc <= z + R; zc++) {
				        const e = getTreeValue(xc, zc);
				        if (e > max) { max = e; }
				      }
				    }
				}
			    if (getTreeValue(x, z) == max) {
			      // place tree at xc,yc
				  const height = blockHeight + Math.floor(max * 6) + 3
				  treeMap.push(height);
				  addLeaves(x, height, z);
			    }
				else {
					treeMap.push(blockHeight);
				}
				// if (biome > 0.98) { // && treeHeight > treeBaseline && blockHeight > waterHeight) {
				// 	//const height = Math.round(blockHeight + 3 + 60 * (treeHeight - treeBaseline));
				// 	//addLeaves(x, z, height, 2);
				// 	treeMap.push(blockHeight + 3);
				// }

			}
		}

		const grass = Block.get(5);
		const dirt = Block.get(2);
		const stone = Block.get(3);
		const air = Block.get(1);
		const oak = Block.get(4);
		const water = Block.get(6);
		const sand = Block.get(7);
		const leaf = Block.get(8);

		const leafChunkData = this.manager.getChunkLeafData(kx, kz);

		for (let i = 0; i < height; i++) {
			const plane = this.elements[i];
			for (let ii = 0; ii < this.area; ii++) {
				const ground = heightMap[ii];
				const tree = treeMap[ii];
				const leafdata = leafChunkData && leafChunkData[ii];
				const underWater = ground <= waterHeight;

				if (underWater) {
					if (i > waterHeight) {
						if (leafdata && leafdata.has(i)) {
							plane[ii] = leaf.instance();
						}
						else {
							plane[ii] = air.instance();
						}
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
						else if (leafdata && leafdata.has(i)) {
							plane[ii] = leaf.instance();
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
		const position = this.getPosition();
		const kx = position.x / this.width;
		const kz = position.z / this.width;

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

					const position = [ x, i, y ];

					//const faces = primaryFaces;
					if (current.individual) {
						const faces = secondaryFaces;
						faces.push(
							[ Block.TOP, position, current.getTexture("top"), Block.NORMAL.TOP ],
							[ Block.BOTTOM, position, current.getTexture("bottom"), Block.NORMAL.BOTTOM ],
							[ Block.FRONT, position, current.getTexture("front"), Block.NORMAL.FRONT ],
							[ Block.BACK, position, current.getTexture("back"), Block.NORMAL.BACK ],
							[ Block.LEFT, position, current.getTexture("left"), Block.NORMAL.LEFT ],
							[ Block.RIGHT, position, current.getTexture("right"), Block.NORMAL.RIGHT ],
						);

					}
					else if (current.transparent) {
						const faces = secondaryFaces;

						if (!top || !top.solid) {
							faces.push([ Block.TOP, position, current.getTexture("top"), Block.NORMAL.TOP ]);
						}
						if (!bottom || !bottom.solid) {
							faces.push([ Block.BOTTOM, position, current.getTexture("bottom"), Block.NORMAL.BOTTOM ]);
						}
						if (!front || !front.solid) {
							faces.push([ Block.FRONT, position, current.getTexture("front"), Block.NORMAL.FRONT ]);
						}
						if (!back || !back.solid) {
							faces.push([ Block.BACK, position, current.getTexture("back"), Block.NORMAL.BACK ]);
						}
						if (!left || !left.solid) {
							faces.push([ Block.LEFT, position, current.getTexture("left"), Block.NORMAL.LEFT ]);
						}
						if (!right || !right.solid) {
							faces.push([ Block.RIGHT, position, current.getTexture("right"), Block.NORMAL.RIGHT ]);
						}
					}
					else {
						const faces = primaryFaces;
						if (!top || !top.solid || top.transparent) {
							faces.push([ Block.TOP, position, current.getTexture("top"), Block.NORMAL.TOP ]);
						}
						if (!bottom || !bottom.solid || bottom.transparent) {
							faces.push([ Block.BOTTOM, position, current.getTexture("bottom"), Block.NORMAL.BOTTOM ]);
						}
						if (!front || !front.solid || front.transparent) {
							faces.push([ Block.FRONT, position, current.getTexture("front"), Block.NORMAL.FRONT ]);
						}
						if (!back || !back.solid || back.transparent) {
							faces.push([ Block.BACK, position, current.getTexture("back"), Block.NORMAL.BACK ]);
						}
						if (!left || !left.solid || left.transparent) {
							faces.push([ Block.LEFT, position, current.getTexture("left"), Block.NORMAL.LEFT ]);
						}
						if (!right || !right.solid || right.transparent) {
							faces.push([ Block.RIGHT, position, current.getTexture("right"), Block.NORMAL.RIGHT ]);
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
		const normalArray = new Float32Array(count * 3);
		const textureArray = new Float32Array(count * 3);
		const indexArray = new Uint16Array(length * 6);

		let i = 0;
		let vi = 0;
		let ni = 0;
		let ti = 0;
		let ii = 0;

		for (const face of faces)
		{
			const verticies = face[0];
			const position = face[1];
			const texture = face[2];
			const normals = face[3];

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

			normalArray[ni++] = normals[0].x;
			normalArray[ni++] = normals[0].y;
			normalArray[ni++] = normals[0].z;

			normalArray[ni++] = normals[1].x;
			normalArray[ni++] = normals[1].y;
			normalArray[ni++] = normals[1].z;

			normalArray[ni++] = normals[2].x;
			normalArray[ni++] = normals[2].y;
			normalArray[ni++] = normals[2].z;

			normalArray[ni++] = normals[3].x;
			normalArray[ni++] = normals[3].y;
			normalArray[ni++] = normals[3].z;

			textureArray[ti++] = texture[0];
			textureArray[ti++] = texture[1];
			textureArray[ti++] = texture[2];

			textureArray[ti++] = texture[3];
			textureArray[ti++] = texture[4];
			textureArray[ti++] = texture[5];

			textureArray[ti++] = texture[6];
			textureArray[ti++] = texture[7];
			textureArray[ti++] = texture[8];

			textureArray[ti++] = texture[9];
			textureArray[ti++] = texture[10];
			textureArray[ti++] = texture[11];

			indexArray[ii++] = i;
			indexArray[ii++] = i + 1;
			indexArray[ii++] = i + 2;
			indexArray[ii++] = i;
			indexArray[ii++] = i + 2;
			indexArray[ii++] = i + 3;

			i += 4;
		}

		entity.setNormalBuffer(normalArray);
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
