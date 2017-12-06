class ChunkManager {
	constructor (game, width, height) {
		this.chunkWidth = width;
		this.chunkHeight = height;
		this.game = game;

		game.on("frame", dt => this.onTick(dt));

	}
	onTick (dt) {

	}
	createChunk () {
		// (gl, width, height, defaultBlock)
	}
}
