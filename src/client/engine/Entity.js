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
		this.normalBuffer = gl.createBuffer();
		this.texture = null;
		this.shouldUpdate = true;
		this.transparent = false;
	}
	getDepth (cameraMatrix) {
		let x = 0;
		let y = 0;
		let z = 0;

		if (this.rotation.x != 0 || this.rotation.y != 0 || this.rotation.z != 0 || this.rotation.w != 1) {
			const e = this.matrix.elements;
			const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

			x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
			y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
			z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;
		}
		else {
			x = this.position.x;
			y = this.position.y;
			z = this.position.z;
		}

		const e = cameraMatrix.elements;
		const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		return ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;
	}
	release () {
		const gl = this.context;

		gl.deleteBuffer(this.vertexBuffer);
		gl.deleteBuffer(this.indexBuffer);
		gl.deleteBuffer(this.textureBuffer);
		gl.deleteBuffer(this.normalBuffer);

		this.context = null;
		this.position = null;
		this.rotation = null;
		this.scale = null;
		this.matrix = null;
		this.length = 0;
		this.vertexBuffer = null;
		this.indexBuffer = null;
		this.textureBuffer = null;
		this.normalBuffer = null;
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
		clone.normalBuffer = this.normalBuffer;

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
	setNormalBuffer (normals, dynamic = false) {
		const gl = this.context;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, normals, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
	}
	setTexture (t) {
		this.texture = t;
	}
	setPosition (v) {
		this.position.copy(v);
		this.shouldUpdate = true;
	}
	move (x, y, z) {
		this.position.x += x;
		this.position.y += y;
		this.position.z += z;
		this.shouldUpdate = true;
	}
}
