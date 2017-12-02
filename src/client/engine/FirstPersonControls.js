import { CompositeDisposable } from "../events/CompositeDisposable.js";
import { Disposable } from "../events/Disposable.js";
import { Vector3 } from "../math/Vector3.js";

export class FirstPersonControls {
	constructor (doc, game, max, acc) {
		this.subscribers = new CompositeDisposable();
		this.subscribers.add(Disposable.from(doc, "keydown", e => this.onKeyDown(e)));
		this.subscribers.add(Disposable.from(doc, "keyup", e => this.onKeyDown(e)));
		this.subscribers.add(Disposable.from(doc, "keydown", e => this.onKeyUp(e)));
		this.subscribers.add(Disposable.from(doc, "mousemove", e => this.onMouseMove(e)));
		this.subscribers.add(game.on("frame", dt => this.onTick(dt)));
		this.max = max;
		this.rotation = new Vector3(0, 0, 0);
		this.velocity = new Vector3(0, 0, 0);
		this.camera = game.camera;
		this.keys = {
			w: false,
			a: false,
			s: false,
			d: false,
			space: false,
			shift: false
		};

	}
	onTick (dt) {
		const key = this.keys;

		if (key.w != key.s) {
			// accelarate
			if (key.w) {

			} else {

			}
		} else {
			// decelarate
		}

		if (key.a != key.d) {
			if (key.a) {

			} else {

			}
		}

		if (key.space != key.shift) {
			if (key.space) {

			} else {

			}
		}

		//this.camera.move(this.velocity);
		this.camera.rotate(this.rotation.x, this.rotation.y, 0);
	}
	onKeyDown (e) {
		e.preventDefault();
		const delta = new Vector3();

		switch (e.key) {
			case "w":
				delta.y = 1;
				break;
			case "a":
				delta.x = -1;
				break;
			case "s":
				delta.y = -1;
				break;
			case "d":
				delta.x = 1;
				break;
			case " ":
				delta.z = 1;
				break;
			case "Shift":
				delta.z = -1;
				break;
		}
		this.camera.move(delta.divide(4));
		console.log(this.camera.position);
	}
	onKeyUp (e) {

	}
	onMouseMove (e) {
		this.rotation.x += e.movementX / 200;
		this.rotation.z += e.movementY / 200;
	}
}
