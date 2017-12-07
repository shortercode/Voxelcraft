import { Vector3 } from "../math/Vector3.js";
import { Quaternion } from "../math/Quaternion.js";
import { Matrix4 } from "../math/Matrix4.js";
import { getTextureCoords } from "./loadTexture.js";

export class Entity {
	constructor (gl) {
		this.context = gl;
		this.position = new Vector3();
		this.rotation = new Quaternion();
		this.scale = new Vector3(1, 1, 1);
		this.matrix = new Matrix4();
		this.length = 0;
		this.vertexBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		this.textureBuffer = gl.createBuffer();
		this.texture = null;
		this.shouldUpdate = true;
	}
	release () {
		const gl = this.context;

		gl.deleteBuffer(this.vertexBuffer);
		gl.deleteBuffer(this.indexBuffer);
		gl.deleteBuffer(this.textureBuffer);

		this.context = null;
		this.position = null;
		this.rotation = null;
		this.scale = null;
		this.matrix = null;
		this.length = 0;
		this.vertexBuffer = null;
		this.indexBuffer = null;
		this.textureBuffer = null;
		this.texture = null;
		this.shouldUpdate = true;
	}
	clone () {
		const clone = new Entity(this.context);
		clone.position = this.position.clone();
		clone.rotation = this.rotation.clone();
		clone.scale = this.scale.clone();
		clone.matrix = this.matrix.clone();
		clone.length = this.length;
		// reuse existing buffers
		clone.vertexBuffer = this.vertexBuffer;
		clone.indexBuffer = this.indexBuffer;
		clone.textureBuffer = this.textureBuffer;

		clone.texture = this.texture;
		return clone;
	}
	update () {
		if (this.shouldUpdate){
			this.matrix.compose(this.position, this.rotation, this.scale);
			this.shouldUpdate = false;
		}
		return this.matrix;
	}
	setVertexBuffer (verticies, dynamic = false) {
		const gl = this.context;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, verticies, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
	}
	setIndexBuffer (indices, dynamic = false) {
		const gl = this.context;
		this.length = indices.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
	}
	setTextureBuffer (locations, dynamic = false) {
		const gl = this.context;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, locations, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
	}
	setTexture (t) {
		this.texture = t;
	}
	setPosition (v) {
		this.positon.copy(v);
		this.shouldUpdate = true;
	}
	move (x, y, z) {
		this.position.x += x;
		this.position.y += y;
		this.position.z += z;
		this.shouldUpdate = true;
	}
	makeCube (x, y, z, front, back = front, top = front, bottom = front, right = front, left = front) {
		x *= 0.5;
		y *= 0.5;
		z *= 0.5;

		this.setVertexBuffer(new Float32Array([
			// front
			-x, -y, z,
			x, -y, z,
			x, y, z,
			-x, y, z,
			// back
			-x, -y, -z,
			-x, y, -z,
			x, y, -z,
			x, -y, -z,
			// top
			-x, y, -z,
			-x, y, z,
			x, y, z,
			x, y, -z,
			// bottom
			-x, -y, -z,
			x, -y, -z,
			x, -y, z,
			-x, -y, z,
			// right
			x, -y, -z,
			x, y, -z,
			x, y, z,
			x, -y, z,
			// left
			-x, -y, -z,
			-x, -y, z,
			-x, y, z,
			-x, y, -z
		]));

		front = getTextureCoords(front);
		back = getTextureCoords(back);
		top = getTextureCoords(top);
		bottom = getTextureCoords(bottom);
		right = getTextureCoords(right);
		left = getTextureCoords(left);

		this.setTextureBuffer(new Float32Array([

			front[4], front[5],
			front[6], front[7],
			front[0], front[1],
			front[2], front[3],

			back[6], back[7],
			back[0], back[1],
			back[2], back[3],
			back[4], back[5],

			top[0], top[1],
			top[2], top[3],
			top[4], top[5],
			top[6], top[7],

			bottom[0], bottom[1],
			bottom[2], bottom[3],
			bottom[4], bottom[5],
			bottom[6], bottom[7],

			right[6], right[7],
			right[0], right[1],
			right[2], right[3],
			right[4], right[5],

			left[4], left[5],
			left[6], left[7],
			left[0], left[1],
			left[2], left[3],

		]));

		this.setIndexBuffer(new Uint16Array([
				0, 1, 2, 0, 2, 3,
				4, 5, 6, 4, 6, 7,
				8, 9, 10, 8, 10, 11,
				12, 13, 14, 12, 14, 15,
				16, 17, 18, 16, 18, 19,
				20, 21, 22, 20, 22, 23
		]));
	}
}
