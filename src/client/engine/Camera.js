import { Matrix4 } from "../math/Matrix4.js";
import { Quaternion } from "../math/Quaternion.js";
import { Vector3 } from "../math/Vector3.js";

const DEG2RAD = Math.PI / 180;

export class Camera {
	constructor (aspect, fov, near, far) {
		this.matrix = new Matrix4();
		this.perspective = new Matrix4();
		this.position = new Vector3();
		this.rotationMatrix = new Matrix4();
		this.rotation = new Quaternion();
		this.scale = new Vector3(1, 1, 1);
		this.shouldUpdate = true;
		this.fov = fov;
		this.near = near;
		this.far = far;
		this.change(aspect, fov, near, far);
	}
	change (aspect, fov = this.fov, near = this.near, far = this.far) {
		const top = near * Math.tan(DEG2RAD * 0.5 * fov);
		//const height = top + top;
		//const width = aspect * height;
		const bottom = -top;
		const left = aspect * bottom;
		const right = -left;

		this.perspective.perspective(left, right, top, bottom, near, far);
		this.shouldUpdate = true;
	}
	update () {
		if (this.shouldUpdate) {
			this.rotationMatrix.identity().positon(this.position);
			this.matrix.rotate(this.rotation);
			this.matrix.multiply(this.rotationMatrix);
			//this.matrix.multiply(this.perspective);
			this.shouldUpdate = false;
		}
		return this.matrix;
	}
	move (delta) {
		this.position.add(delta);
		this.shouldUpdate = true;
	}
	rotate (x, y, z) {
		this.rotation.setEular(x, y, z);
		this.shouldUpdate = true;
	}
}
