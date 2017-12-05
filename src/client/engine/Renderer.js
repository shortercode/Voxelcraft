import { Camera } from "./Camera.js";
import { Scene } from "./Scene.js";
import { Entity } from "./Entity.js";
import { Dispatcher } from "../events/Dispatcher.js";
import { createShader, getFragmentSource, getVertexSource, getAttributes, getUniforms } from "./createShader.js";

export class Renderer {
	constructor () {
		this.element = document.createElement('canvas');
		this.context = this.element.getContext("webgl2", { premultipliedAlpha: true, antialias: true } );
		this.pixelRatio = devicePixelRatio;
		this.camera = null;
		this.scene = null;
		this.shader = null;
		this.width = 0;
		this.height = 0;

		const gl = this.context;

		gl.clearColor(0x7F / 0xFF, 0xB1 / 0xFF, 0xFF / 0xFF, 1);
		gl.clearDepth(1);

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LESS);

		gl.disable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		// gl.enable(gl.BLEND);
		// //gl.blendEquation( gl.FUNC_ADD );
		// gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
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

		let texture = null;
		let textureBuffer = null;
		let vertexBuffer = null;

		for (const entity of this.scene.entities()) {
			const entityMatrix = entity.update();
			gl.uniformMatrix4fv(shader.uniforms.entity, false, entityMatrix.elements);

			if (textureBuffer != entity.textureBuffer)
			{
				// texture buffer
				gl.bindBuffer(gl.ARRAY_BUFFER, entity.textureBuffer);
				gl.vertexAttribPointer(shader.attributes.textureBuffer, 2, gl.FLOAT, false, 0, 0);
				textureBuffer = entity.textureBuffer;
			}

			if (vertexBuffer != entity.vertexBuffer)
			{
				// vertex buffer
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, entity.indexBuffer);
				gl.bindBuffer(gl.ARRAY_BUFFER, entity.vertexBuffer);
				gl.vertexAttribPointer(shader.attributes.vertexBuffer, 3, gl.FLOAT, false, 0, 0);
				vertexBuffer = entity.vertexBuffer;
			}
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
