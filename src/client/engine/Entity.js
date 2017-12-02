import { Vector3 } from "../math/Vector3.js";
import { Quaternion } from "../math/Quaternion.js";
import { Matrix4 } from "../math/Matrix4.js";
import { loadTexture } from "./loadTexture.js";

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
	async setTexture (src) {
		const texture = await loadTexture(this.context, src);
		this.texture = texture;
	}
	move (x, y, z) {
		this.position.x += x;
		this.position.y += y;
		this.position.z += z;
		this.shouldUpdate = true;
	}
	makeCube (x, y, z) {
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

		this.setTextureBuffer(new Float32Array([
			0, 0,
			1, 0,
			1, 1,
			0, 1,

			0, 0,
			1, 0,
			1, 1,
			0, 1,

			0, 0,
			1, 0,
			1, 1,
			0, 1,

			0, 0,
			1, 0,
			1, 1,
			0, 1,

			0, 0,
			1, 0,
			1, 1,
			0, 1,

			0, 0,
			1, 0,
			1, 1,
			0, 1
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
