import { Entity } from "./Entity.js";
import { Block } from "./Block.js";

export class Chunk {
	constructor (gl, width, height, defaultBlock) {
		// this.positon = new Vect
		this.width = width;
		this.area = width ** 2;
		this.height = height;
		this.elements = [];

		const blockType = Block.get(defaultBlock);

		for (let i = 0; i < height; i++) {
			const plane = [];
			for (let ii = 0; ii < this.area; ii++) {
				plane.push(blockType.instance());
			}
			this.elements.push(plane);
		}

		this.entity = new Entity(gl);

		this.render();
	}
	setPosition (v) {
		this.entity.setPosition(v);
	}
	render () {
		console.time("render");
		const getBlock = (plane, x, y) => {
			if (!plane || y < 0 || x < 0 || x >= this.width || y >= this.width)
				return null;
			return plane[ y * this.width + x ];
		}

		const faces = [];

		for (let i = 0; i < this.height; i++) {
			const previousPlane = this.elements[i - 1];
			const currentPlane = this.elements[i];
			const nextPlane =  this.elements[i + 1];
			for (let x = 0; x < this.width; x++) {
				for (let y = 0; y < this.width; y++) {
					const current = getBlock(currentPlane, x, y);
					const top = getBlock(nextPlane, x, y);
					const bottom = getBlock(previousPlane, x, y);
					const front = getBlock(currentPlane, x, y + 1);
					const back = getBlock(currentPlane, x, y - 1);
					const left = getBlock(currentPlane, x - 1, y);
					const right = getBlock(currentPlane, x + 1, y);

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

		console.timeEnd	("render");
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
	static load (data) {
		let i = 0;
		for (let y = 0; y < this.height; y++) {
			for (let n = 0; n < this.area; n++) {
				const block = Block.get(data[i++]);
				this.elements[y][n] = block.instance();
			}
		}
	}
}
