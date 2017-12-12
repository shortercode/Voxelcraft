self.onmessage = ({ data }) => {
	const { id, method, parameters } = data;

	const callback = (err = null, data = null, transfer) => {
		const msg = {
			id,
			err,
			data
		};
		self.postMessage(msg, transfer);
	};

	module[method](callback, ...parameters);
};

const chunks = new Map();

function createKey (x, y) {
	return `${x}_${y}`;
}

const module = {
	addChunk (callback, x, y) {
		const key = createKey(x, y);
		const chunk = {
			elements: []
		};
		// load chunk
		callback();
	},
	removeChunk (callback, key) {
		// unload chunk
		callback();
	},
	renderChunk (callback, kx, ky) {
		//const kx = this.entity.position.x / this.width;
		//const kz = this.entity.position.z / this.width;
		const chunk = chunks.get(createKey(kx, ky));
		const leftChunk = chunks.get(createKey(kx - 1, ky));
		const rightChunk = chunks.get(createKey(kx + 1, ky));
		const frontChunk = chunks.get(createKey(kx, ky + 1));
		const backChunk = chunks.get(createKey(kx, ky - 1));

		// console.time("render");
		const getBlock = (n, x, y) => {
			let plane = chunk.elements[n];

			if (y < 0) {
				y = chunk.width + y;
				plane = backChunk && backChunk.elements[n];
			}
			if (x < 0) {
				x = chunk.width + x;
				plane = leftChunk && leftChunk.elements[n];
			}
			if (x >= chunk.width) {
				x -= chunk.width;
				plane = rightChunk && rightChunk.elements[n];
			}
			if (y >= chunk.width) {
				y -= chunk.width;
				plane = frontChunk && frontChunk.elements[n];
			}
			if (!plane)
				return null;
			return plane[ y * chunk.width + x ];
		}

		const faces = [];

		for (let i = 0; i < chunk.height; i++) {
			for (let x = 0; x < chunk.width; x++) {
				for (let y = 0; y < chunk.width; y++) {
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

		const data = [ vertexArray, textureArray, indexArray ];
		callback(null, data, data);
	},
	loadChunk (callback, key, data) {

	},
	generateChunk (callback, key) {
		// generate
		callback();
	}
};
