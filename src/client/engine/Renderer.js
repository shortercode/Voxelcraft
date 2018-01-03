import { Camera } from "./Camera.js";
import { Scene } from "./Scene.js";
import { Entity } from "./Entity.js";
import { Dispatcher } from "../events/Dispatcher.js";
import { createShader, getFragmentSource, getVertexSource, getAttributes, getUniforms } from "./createShader.js";
import { Vector3 } from "../math/Vector3.js";

const light = new Vector3(0.5, 0.7, 1).normalise();

export class Renderer {
	constructor () {
		this.element = document.createElement('canvas');
		this.element.style.zIndex = 0;
		this.context = this.element.getContext("webgl2", { premultipliedAlpha: true, antialias: false } );
		this.pixelRatio = devicePixelRatio;
		this.camera = null;
		this.scene = null;
		this.shader = null;
		this.width = 0;
		this.height = 0;
		this.depthSort = true;

		const gl = this.context;

		gl.clearColor(0x7F / 0xFF, 0xB1 / 0xFF, 0xFF / 0xFF, 1);
		gl.clearDepth(1);

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LESS);

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		gl.enable(gl.BLEND);
		gl.blendEquation( gl.FUNC_ADD );
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	}
	createCamera (aspect, fov, near, far) {
		return new Camera (aspect, fov, near, far);
	}
	createScene () {
		return new Scene ();
	}
	createShader (fragmentSource, vertexSource, attributes, uniforms) {
		return createShader(this.context, fragmentSource, vertexSource, attributes, uniforms);
	}
	createEntity () {
		return new Entity(this.context);
	}
	createDefaultShader () {
		const attributes = getAttributes();
		const uniforms = getUniforms();
		return this.createShader(getFragmentSource(), getVertexSource(), attributes, uniforms);
	}
	setCamera (c) {
		this.camera = c;
	}
	setScene (s) {
		this.scene = s;
	}
	setShader (s) {
		this.shader = s;
		s.use();
	}
	setAtlas (t) {
		this.atlas = t;
		const gl = this.context;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.atlas);
	}
	setSize (width, height) {
		const correctedWidth = width * this.pixelRatio;
		const correctedHeight = height * this.pixelRatio;
		const ratio = width / height;
		this.width = width;
		this.height = height;
		this.element.style.width = `${width}px`;
		this.element.style.height = `${height}px`;
		this.element.width = correctedWidth;
		this.element.height = correctedHeight;
		this.camera.change(ratio);
		this.context.viewport(0, 0, correctedWidth, correctedHeight);
	}
	updateSize () {
		const w = innerWidth;
		const h = innerHeight;

		if (this.width != w || this.height != h)
			this.setSize(w, h);
	}
	render () {
		const gl = this.context;
		const shader = this.shader;

		this.updateSize();

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		const cameraMatrix = this.camera.update();
		gl.uniformMatrix4fv(shader.uniforms.camera, false, cameraMatrix.elements);
		gl.uniformMatrix4fv(shader.uniforms.perspective, false, this.camera.perspective.elements);
		gl.uniform3fv(shader.uniforms.lightDirection, [light.x, light.y, light.z]);

		let texture = null;
		let textureBuffer = null;
		let vertexBuffer = null;

		let entities = Array.from(this.scene.entities());

		if (this.depthSort) {
			entities = entities.sort((a, b) => {
				if (a.transparent !== b.transparent) {
					// draw opaque entities before transparent
					return a.transparent ? 1 : -1;
				}
				else {
					if (a.transparent) {
						// sort transparent object back to front
						return a.getDepth(cameraMatrix) - b.getDepth(cameraMatrix);
					}
					else {
						// sort opaque object front to back
						return b.getDepth(cameraMatrix) - a.getDepth(cameraMatrix);
					}
				}
			})
		}

		for (const entity of entities) {
			const entityMatrix = entity.update();
			gl.uniformMatrix4fv(shader.uniforms.entity, false, entityMatrix.elements);

			// texture buffer
			gl.bindBuffer(gl.ARRAY_BUFFER, entity.textureBuffer);
			gl.vertexAttribPointer(shader.attributes.textureBuffer, 2, gl.FLOAT, false, 0, 0);
			textureBuffer = entity.textureBuffer;

			// vertex buffer
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, entity.indexBuffer);
			gl.bindBuffer(gl.ARRAY_BUFFER, entity.vertexBuffer);
			gl.vertexAttribPointer(shader.attributes.vertexBuffer, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, entity.normalBuffer);
			gl.vertexAttribPointer(shader.attributes.normalBuffer, 3, gl.FLOAT, false, 0, 0);
			vertexBuffer = entity.vertexBuffer;
            //
			// if (texture != this.atl)
			// {
			// 	// texture
			// 	gl.activeTexture(gl.TEXTURE0);
			// 	gl.bindTexture(gl.TEXTURE_2D, this.atlas);
			// 	texture = entity.texture;
			// }

			// draw
			gl.drawElements(gl.TRIANGLES, entity.length, gl.UNSIGNED_SHORT, 0);
		}
	}
}
