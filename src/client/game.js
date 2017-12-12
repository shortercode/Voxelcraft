import { Renderer } from "./engine/Renderer.js";
import { FirstPersonControls } from "./engine/FirstPersonControls.js";
import { Stat } from "./engine/Stat.js";
import { Dispatcher } from "./events/Dispatcher.js";
import { createAtlas } from "./engine/loadTexture.js";
import { ChunkManager } from "./engine/ChunkManager.js";
import { Block } from "./engine/Block.js";

class Game extends Dispatcher {
	constructor () {
		super();
		this.speedo = new Stat(this);
		this.renderer = new Renderer();
		this.camera = this.renderer.createCamera(1, 45, 0.1, 1000);
		this.scene = this.renderer.createScene();
		this.shader = this.renderer.createDefaultShader();

		this.controls = new FirstPersonControls(document, this);

		this.renderer.setCamera(this.camera);
		this.renderer.setScene(this.scene);
		this.renderer.setShader(this.shader);

		(async () => {
			// const atlas = await createAtlas(this.renderer.context, [
			// 	"test_front",
			// 	"test_back",
			// 	"test_left",
			// 	"test_right",
			// 	"test_bottom",
			// 	"test_top"
			// ], 128);

			const atlas = await Block.parseDefinitions(this.renderer.context, "blocks.json");
			const chunkManager = new ChunkManager(this, 20, 100, 15);
			// const dirt = new Block(0, true);
			// //dirt.setAllTextures("stone");
			// dirt.setTexture("front", "test_front");
			// dirt.setTexture("back", "test_back");
			// dirt.setTexture("left", "test_left");
			// dirt.setTexture("right", "test_right");
			// dirt.setTexture("bottom", "test_bottom");
			// dirt.setTexture("top", "test_top");
			//const chunk = new Chunk(this.renderer.context, 16, 100, 2);

			this.renderer.setAtlas(atlas);
			//this.scene.add(chunk.entity);

			let time = performance.now();
			const tick = () => {
				requestAnimationFrame(tick);
				const current = performance.now();
				const dt = current - time;
				time = current;
				this.tick(dt);
			};

			tick();

			this.camera.move({y: -105, z: 5, x: 5});

			document.body.appendChild(this.renderer.element);

			//this.renderer.element.requestPointerLock();
		})();
	}
	getCameraPosition () {
		return this.camera.position.clone();
	}
	tick (dt) {
		this.emit("frame", dt);
		this.renderer.render();
	}
}

new Game();
