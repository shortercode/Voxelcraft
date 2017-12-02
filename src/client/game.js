import { Renderer } from "./engine/Renderer.js";
import { FirstPersonControls } from "./engine/FirstPersonControls.js";
import { Stat } from "./engine/Stat.js";
import { Dispatcher } from "./events/Dispatcher.js";

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

		for (let x = -10; x < 10; x++) {
			for (let y = -10; y < 10; y++) {
				for (let z = -10; z < 10; z++) {
					const cube = this.renderer.createEntity();
					this.scene.add(cube);
					cube.move(x, y, z);
					cube.makeCube(0.1, 0.1, 0.1);
					cube.setTexture("textures/bdc_stone01.png");
				}
			}
		}

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
	}
	tick (dt) {
		this.emit("frame", dt);
		this.renderer.render();
	}
}

new Game();
