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

		this.solidScene = this.renderer.createScene();
		this.transparentScene = this.renderer.createScene();

		this.scene.add(this.solidScene);
		this.scene.add(this.transparentScene);

		this.shader = this.renderer.createDefaultShader();
		this.chunkManager = null;

		this.controls = new FirstPersonControls(document, this);

		this.renderer.setCamera(this.camera);
		this.renderer.setScene(this.scene);
		this.renderer.setShader(this.shader);

		(async () => {

			const atlas = await Block.parseDefinitions(this.renderer.context, "blocks.json");
			this.chunkManager = new ChunkManager(this, 16, 100, 10);
			this.renderer.setAtlas(atlas);

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
