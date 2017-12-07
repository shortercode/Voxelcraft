class ChunkManager {
	constructor (game, width, height) {
		this.chunkWidth = width;
		this.chunkHeight = height;
		this.game = game;

		this.loadedChunks = [];
		game.on("frame", dt => this.onTick(dt));

	}
	onTick (dt) {

	}
	createChunk (pos) {
		const chunk = new Chunk(this.game.renderer.context, this.chunkWidth, this.chunkHeight);
		chunk.setPosition(pos);
		// (gl, width, height, defaultBlock)
	}
	shouldChunkBeLoaded () {

	}
}
