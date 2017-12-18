import { CompositeDisposable } from "../events/CompositeDisposable.js";
import { Disposable } from "../events/Disposable.js";
import { Vector3 } from "../math/Vector3.js";
import { raycast } from "./raycast.js";

const GRAVITY = 0;

export class FirstPersonControls {
	constructor (doc, game, max, acc) {
		this.canvas = game.renderer.element;
		this.subscribers = new CompositeDisposable();

		this.subscribers.add(Disposable.from(document, "keydown", e => this.onKeyDown(e)));
		this.subscribers.add(Disposable.from(document, "keyup", e => this.onKeyUp(e)));
		this.subscribers.add(Disposable.from(document, "pointerlockchange", e => this.onPointerLockChange(e)));
		this.subscribers.add(Disposable.from(document, "mousedown", e => this.onMouseDown(e)));
		this.subscribers.add(game.on("frame", dt => this.onTick(dt)));

		this.moveListener = null;
		this.max = max;
		this.game = game;
		this.rotation = new Vector3(0, 0, 0);
		this.velocity = new Vector3(0, 0, 0);
		this.camera = game.camera;
		this.keystate = {
			"w": false,
			"a": false,
			"s": false,
			"d": false,
			" ": false,
			"Shift": false
		};
	}
	onTick (dt) {
		const keystate = this.keystate;
		const delta = new Vector3();
		if (keystate.w != keystate.s) {
			// accelarate
			delta.z = keystate.w ? 1 : -1;
		}

		if (keystate.a != keystate.d) {
			delta.x = keystate.a ? 1 : -1;
		}

		if (keystate[" "] != keystate.Shift) {
			delta.y = keystate.Shift ? 1 : -1;
		}
		else {
			delta.y = GRAVITY;
		}

		const cs = Math.cos(this.rotation.y);
		const sn = Math.sin(this.rotation.y);
		const x = delta.x;
		const z = delta.z;

		// apply rotation
		delta.x = x * cs - z * sn;
		delta.z = x * sn + z * cs;

		//return

		dt *= 0.05;

		const drag = 0.27;

		const start = this.camera.position;
		const velocity = this.velocity;
		const acceleration = delta;
		const finish = velocity.clone().multiply(dt).add(start);

		let n = 10;

		raycast (start, finish, (x, y, z) => {
			n--;
			if (n < 0)
				return true;
			const block = this.game.chunkManager.getBlockAt(x, y, z);
		    if (block && block.opaque) {
				finish.x = x;
				finish.y = y;
				finish.z = z;
				return true;
		        // stop
		    }
		});
        //
		this.camera.setPosition(finish);
        //
		// // full: F = 0.5 * fluidDensity * velocity ** 2 * dragCoefficient * area
		// // simplified: F = velocity ** 2 * drag
		const magnitude = velocity.length() ** 2;
		const deceleration = velocity.clone().normalise().multiply(-drag * magnitude);

		acceleration.add(deceleration).multiply(dt);
		velocity.add(acceleration);


	}
	onPointerLockChange (e) {
		if (document.pointerLockElement === this.canvas) {
			this.moveListener = Disposable.from(document, "mousemove", e => this.onMouseMove(e));
		} else {
			this.moveListener.dispose();
			this.moveListener = null;
		}
	}
	onMouseDown (e) {
		if (document.pointerLockElement !== this.canvas) {
			this.canvas.requestPointerLock();
		}
	}
	onKeyDown (e) {
		e.preventDefault();
		switch (e.key) {
			case "w":
			case "a":
			case "s":
			case "d":
			case " ":
			case "Shift":
				this.keystate[e.key] = true;
				break;
		}
	}
	onKeyUp (e) {
		e.preventDefault();
		switch (e.key) {
			case "w":
			case "a":
			case "s":
			case "d":
			case " ":
			case "Shift":
				this.keystate[e.key] = false;
				break;
		}
	}
	onMouseMove (e) {
		const sensitivity = 1 / 200;
		const deltaX = e.movementX * sensitivity;
		const deltaY = e.movementY * sensitivity;

		const max = Math.PI * 0.5;
		const rot = this.rotation;

		const x = rot.x + deltaY;

		rot.y += deltaX;
		rot.x =  Math.abs(x) > max ? ( x < 0 ? -max : max ) :  x;

		this.camera.rotate(rot.x, rot.y, 0);
	}
}
