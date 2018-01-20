import { CompositeDisposable } from "../events/CompositeDisposable.js";
import { Disposable } from "../events/Disposable.js";
import { Vector3 } from "../math/Vector3.js";
import { raycast } from "./raycast.js";
import { Block } from "./Block.js";
import { Entity } from "./Entity.js";

const GRAVITY = 0;

function createFloatingCursor (renderer) {
	const block = Block.get(2);
	const position = new Vector3();
	const faces = [
		block.getFace("top", position),
		block.getFace("bottom", position),
		block.getFace("front", position),
		block.getFace("back", position),
		block.getFace("left", position),
		block.getFace("right", position)
	];
	const entity = renderer.createEntity();
	//entity.scale.set(1, 0.1, 0.1);
	entity.generateFromFaces(faces);

	console.log(entity)

	return entity;
}

export class FirstPersonControls {
	constructor (doc, game, max, acc) {
		this.canvas = game.renderer.element;
		this.subscribers = new CompositeDisposable();

		this.subscribers.add(Disposable.from(document, "keydown", e => this.onKeyDown(e)));
		this.subscribers.add(Disposable.from(document, "keyup", e => this.onKeyUp(e)));
		this.subscribers.add(Disposable.from(document, "pointerlockchange", e => this.onPointerLockChange(e)));
		this.subscribers.add(Disposable.from(document, "mousedown", e => this.onMouseDown(e)));
		this.subscribers.add(game.on("frame", dt => this.onTick(dt)));
		this.floatingCursor = createFloatingCursor(game.renderer);
		game.transparentScene.add(this.floatingCursor);
		this.moveListener = null;
		this.max = max;
		this.game = game;
		this.rotation = new Vector3(0, 0, 0);
		this.velocity = new Vector3(0, 0, 0);
		this.camera = game.camera;
		this.keystate = {
			"KeyW": false,
			"KeyA": false,
			"KeyS": false,
			"KeyD": false,
			"Space": false,
			"ShiftLeft": false
		};
	}
	onTick (dt) {
		const keystate = this.keystate;
		const delta = new Vector3();
		if (keystate.KeyW != keystate.KeyS) {
			// accelarate
			delta.z = keystate.KeyW ? 1 : -1;
		}

		if (keystate.KeyA != keystate.KeyD) {
			delta.x = keystate.KeyA ? 1 : -1;
		}

		if (keystate.Space != keystate.ShiftLeft) {
			delta.y = keystate.ShiftLeft ? 1 : -1;
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

		const drag = 0.9;

		const start = this.camera.position;
		const velocity = this.velocity;
		const acceleration = delta;
		const finish = velocity.clone().multiply(dt).add(start);
		//const originBlock = this.game.chunkManager.getBlockAt(start.x, start.y, start.z);

		const cursor = this.floatingCursor.position;

		cursor.copy(this.camera.facing).multiply(10).add(start);

		console.log(start, cursor);

		// if (!originBlock || !originBlock.opaque)
		// {
			//let n = 1000;

			// 	console.log("ray");
			// raycast (start, finish, (x, y, z, px, py, pz) => {
      //
			// 	n--;
			// 	if (n < 0) {
			// 		throw new Error("Excessive ray trace");
			// 	}
      //
			// 	const block = this.game.chunkManager.getBlockAt(x, y, z);
			// 	// console.log(x, y, z, block);
		  //   if (block && block.opaque) {
			// 		//console.log("snap");
			// 		finish.x = px;
			// 		finish.y = py;
			// 		finish.z = pz;
			// 		return true;
		  //       // stop
		  //   }
			// });
		//}

		this.camera.setPosition(finish);
		velocity.clone(finish).sub(start);

		if (velocity.isNaN())
			throw new Error("Invalid velocity");

		// // full: F = 0.5 * fluidDensity * velocity ** 2 * dragCoefficient * area
		// // simplified: F = velocity ** 2 * drag
		const magnitude = velocity.length();

		// console.log(magnitude);

		if (magnitude < 0.2 && acceleration.lengthSq() == 0) {
			velocity.set(0, 0, 0);
		} else {
			const deceleration = velocity.clone().normalise().multiply(-drag * magnitude * magnitude);
			acceleration.add(deceleration);//.multiply(16);
			velocity.add(acceleration);
		}

		if (velocity.isNaN())
			throw new Error("Invalid velocity");

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
		const { button } = e;
		if (document.pointerLockElement !== this.canvas) {
			this.canvas.requestPointerLock();
		}
		else {
			const start = this.camera.position;
			const direction = this.camera.facing;
			const radius = 5;
			console.log("Start", start);
			console.log("Direction", direction);
			let xx, yy, zz, hit;
			raycast(start, direction, radius, (x, y, z, face) => {
				console.log(x, y, z)
				const block = this.game.chunkManager.getBlockAt(x, y, z);
				if (block && block.solid) {
					if (button == 0) {
						this.game.chunkManager.removeBlockAt(x, y, z);
						hit = false;
					}
					return true;
				}
				else {
					xx = x;
					yy = y;
					zz = z;
					hit = true;
				}
			});
			if (hit && button == 2) {
				const stone = Block.get(3);
				this.game.chunkManager.setBlockAt(xx, yy, zz, stone);
			}
		}
	}
	onKeyDown (e) {
		e.preventDefault();
		switch (e.code) {
			case "KeyW":
			case "KeyA":
			case "KeyS":
			case "KeyD":
			case "Space":
			case "ShiftLeft":
				this.keystate[e.code] = true;
				break;
		}
	}
	onKeyUp (e) {
		e.preventDefault();
		switch (e.code) {
			case "KeyW":
			case "KeyA":
			case "KeyS":
			case "KeyD":
			case "Space":
			case "ShiftLeft":
				this.keystate[e.code] = false;
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
