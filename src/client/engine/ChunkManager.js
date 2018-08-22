import { Vector3 } from "../math/Vector3.js";
import { Block } from "./Block.js";
import { Chunk } from "./Chunk.js";

export class ChunkManager {
	constructor (game, width, height, range) {
		this.chunkWidth = width;
		this.chunkHeight = height;
		this.viewDistance = range;
		this.game = game;

		this.chunkTable = new Map();
		this.loadedChunks = new Map();
		this.chunkLeafData = new Map();
		this.game.on("frame", dt => this.onTick(dt));
		this.user = new Vector3(Infinity, Infinity, Infinity);
		this.renderQueue = [];
		this.renderSet = new Set();
	}
	getChunkLeafData (x, y) {
		const key = `${x}_${y}`;
		return this.chunkLeafData.get(key);
	}
	createChunkLeafData (x, y) {
		const key = `${x}_${y}`;

		// if we already have the leafdata, return it
		if (this.chunkLeafData.has(key))
			return this.chunkLeafData.get(key);

		// if the chunk exists it shouldn't have leaf data
		if (this.loadedChunks.has(key) || this.chunkTable.has(key))
			return false;

		const size = this.chunkWidth ** 2;
		const chunk = Array(size);

		this.chunkLeafData.set(key, chunk);

		return chunk;
	}
	getBlockAt (x, y, z) {

		x = Math.floor(x);
		y = Math.floor(y);
		z = Math.floor(z);

		if (y >= this.chunkHeight || y < 0)
			return null;

		const w = this.chunkWidth;
		const d = 1 / w;

		const chunkX = Math.floor(x * d);
		const chunkZ = Math.floor(z * d);
		const key = `${chunkX}_${chunkZ}`;

		const chunk = this.get(key);

		if (!chunk)
			return null;

		const plane = chunk.elements[y];

		x = x % w;
		z = z % w;
		x = x < 0 ? x + w : x;
		z = z < 0 ? z + w : z;

		return plane[z * w + x];
	}
	setBlockAt (x, y, z, block) {
		x = Math.round(x);
		y = Math.round(y);
		z = Math.round(z);

		if (y >= this.chunkHeight || y < 0)
			return null;

		const w = this.chunkWidth;
		const d = 1 / w;

		const chunkX = Math.floor(x * d);
		const chunkZ = Math.floor(z * d);
		const key = `${chunkX}_${chunkZ}`;

		const chunk = this.get(key);

		if (!chunk)
			return null;

		chunk.setBlockAt(x, y, z, block);
	}

	removeBlockAt (x, y, z) {
		x = Math.floor(x);
		y = Math.floor(y);
		z = Math.floor(z);

		if (y >= this.chunkHeight || y < 0)
			return null;

		const w = this.chunkWidth;
		const d = 1 / w;

		const chunkX = Math.floor(x * d);
		const chunkZ = Math.floor(z * d);
		const key = `${chunkX}_${chunkZ}`;

		const chunk = this.get(key);

		if (!chunk)
			return null;

		chunk.setBlockAt(x, y, z, Block.get(1));
	}
	get (key) {
		return this.loadedChunks.get(key);
	}
	onTick (dt) {
		const user = this.game
			.getCameraPosition()
			.divide(this.chunkWidth)
			.floor();

		const hasMoved = !user.equals(this.user);

		if (hasMoved)
			this.user.copy(user);

		const shouldBeLoaded = new Map();

		const range = this.viewDistance;
		const rangeSq = range ** 2;
		const n = range * 2 + 1;
		for (let x = 0; x < n; x ++) {
			for (let y = 0; y < n; y++) {
				if ((x - range) ** 2 + (y - range) ** 2 < rangeSq)
				{
					const xn = user.x + x - range;
					const yn = user.z + y - range;
					const key = `${xn}_${yn}`;

					shouldBeLoaded.set(key, new Vector3(
						xn * this.chunkWidth,
						0,
						yn * this.chunkWidth
					));
				}
			}
		}

		for (const [key, chunk] of this.loadedChunks) {
			if (shouldBeLoaded.has(key)) {
				shouldBeLoaded.delete(key);
			}
			else {
				this.chunkTable.set(key, chunk.save());
				this.unloadChunk(chunk);
				this.loadedChunks.delete(key);
			}
		}

		const renderQueue = Array.from(shouldBeLoaded).sort(([ a ], [ b ]) => {
			const [ ax, ay ] = a.split("_");
			const [ bx, by ] = b.split("_");

			const x = Math.abs(bx - user.x) - Math.abs(ax - user.x);
			const y = Math.abs(by - user.z) - Math.abs(ay - user.z);

			return x + y;
		});

		if (renderQueue.length) {
			const [key, position] = renderQueue.pop();
			const chunk = this.createChunk(position);
			const [ x, y ] = key.split("_");

			this.loadedChunks.set(key, chunk);

			if (this.chunkTable.has(key)) {
				chunk.load(this.chunkTable.get(key));
			}
			else {
				chunk.generate();
				this.chunkLeafData.delete(key);
			}

			const leftKey = `${+x - 1}_${y}`;
			const rightKey = `${+x + 1}_${y}`;
			const topKey = `${x}_${+y - 1}`;
			const bottomKey = `${x}_${+y + 1}`;
			const left = this.loadedChunks.get(leftKey);
			const right = this.loadedChunks.get(rightKey);
			const top = this.loadedChunks.get(topKey);
			const bottom = this.loadedChunks.get(bottomKey);

			// if we were to generate more chunks per frame this could be done
			// more efficiently by marking these chunks as "shouldRender" and
			// rendering when required. This will reduce duplicate renders
			chunk.render();

			if (left) {
				left.render();
			}
			if (right) {
				right.render();
			}
			if (top) {
				top.render();
			}
			if (bottom) {
				bottom.render();
			}

			let chunks = 0;
			let triangles = 0;
			let vertices = 0;
			let faces = 0;
			for (const chunk of this.loadedChunks.values()) {
				chunks ++;
				triangles += chunk.stats.triangles;
				faces += chunk.stats.faces;
				vertices += chunk.stats.vertices;
			}

			console.log(`Chunks: ${chunks} Triangles: ${triangles} Faces: ${faces} Vertices: ${vertices}`);
		}
	}
	unloadChunk (chunk) {
		this.game.solidScene.remove(chunk.entity);
		this.game.transparentScene.remove(chunk.secondaryEntity);
		chunk.release();
	}
	createChunk (pos) {
		const chunk = new Chunk(this.game.renderer.context, this.chunkWidth, this.chunkHeight, this);
		chunk.setPosition(pos);
		this.game.solidScene.add(chunk.entity);
		this.game.transparentScene.add(chunk.secondaryEntity);
		// this.loadedChunks.add(chunk);

		return chunk;
	}
}
