import { Renderer } from "./engine/Renderer.js";
import { FirstPersonControls } from "./engine/FirstPersonControls.js";
import { Stat } from "./engine/Stat.js";
import { Dispatcher } from "./events/Dispatcher.js";
import { createAtlas } from "./engine/loadTexture.js";
import { Chunk } from "./engine/Chunk.js";
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
			const atlas = await createAtlas(this.renderer.context, [
				"test_front",
				"test_back",
				"test_left",
				"test_right",
				"test_bottom",
				"test_top"
			], 128);

			const dirt = new Block(0, true);
			//dirt.setAllTextures("stone");
			dirt.setTexture("front", "test_front");
			dirt.setTexture("back", "test_back");
			dirt.setTexture("left", "test_left");
			dirt.setTexture("right", "test_right");
			dirt.setTexture("bottom", "test_bottom");
			dirt.setTexture("top", "test_top");
			const chunk = new Chunk(this.renderer.context, atlas, 16, 100, dirt);

			this.renderer.setAtlas(atlas);
			this.scene.add(chunk.entity);
			// const cube = this.renderer.createEntity();
			// cube.makeCube(0.1, 0.1, 0.1, "piston_side", "piston_side", "piston_top_normal", "piston_bottom", "piston_side", "piston_side");
			// // cube.makeCube(0.1, 0.1, 0.1, "textures/TestImage.png");
			// // await cube.setTexture("textures/bdc_stone01.png");
            //
			// for (let x = -10; x < 10; x++) {
			// 	for (let y = -10; y < 10; y++) {
			// 		for (let z = -10; z < 10; z++) {
			// 			const obj = cube.clone();
			// 			obj.move(x, y, z);
			// 			this.scene.add(obj);
			// 			// this.scene.add(cube);
			// 			// cube.move(x, y, z);
			// 			// cube.makeCube(0.1, 0.1, 0.1);
			// 			// cube.setTexture("textures/bdc_stone01.png");
			// 		}
			// 	}
			// }

			let time = performance.now();
			const tick = () => {
				requestAnimationFrame(tick);
				const current = performance.now();
				const dt = current - time;
				time = current;
				this.tick(dt);
			};

			tick();

			document.body.appendChild(this.renderer.element);

			this.renderer.element.requestPointerLock();
		})();
	}
	tick (dt) {
		this.emit("frame", dt);
		this.renderer.render();
	}
}

new Game();
