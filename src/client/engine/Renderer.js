import { Camera } from "./Camera.js";
import { Scene } from "./Scene.js";
import { Entity } from "./Entity.js";
// import { Dispatcher } from "../events/Dispatcher.js";
import { createShader, getFragmentSource, getVertexSource, getAttributes, getUniforms, getSecondaryFragmentSource, getSecondaryVertexSource } from "./createShader.js";
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
		this.intermediate = {
			framebuffer: null,
			albedo: null,
			normal: null,
			position: null
		};
		
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

		this.createScreenSquare();
	}
	createScreenSquare () {

		const gl = this.context;

		const verts = [
			1,  1,
			-1,  1,
			-1, -1,
			1,  1,
			-1, -1,
			1, -1,
		];
		  
		const vertBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
		this.screenGeometry = vertBuffer;
	}
	createIntermediateFrameBuffer () {

		const gl = this.context;
		const width = this.width;
		const height = this.height;

		const createTexture = (format, intFormat, type) => {
			const tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			return tex;
		}

		// Create and bind the framebuffer
		const fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

		// Create the 3 textures of our framebuffer
		const position = createTexture(gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE);
		const albedo = createTexture(gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE);
		const normal = createTexture(gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE);

		// attach the textures
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, albedo, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, normal, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, position, 0);

		// create a depth renderbuffer
		const depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	
		// make a depth buffer
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);	

		this.intermediate.framebuffer = fb;
		this.intermediate.albedo = albedo;
		this.intermediate.normal = normal;
		this.intermediate.position = position;

		// clean up
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
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
		this.shader = this.createShader(getFragmentSource(), getVertexSource(), attributes, uniforms);
	}
	createSecondaryShader () {
		const attributes = [ "vertexBuffer" ];
		const uniforms =  [ "lightDirection", "normals", "albedo" ];
		this.secondaryShader = this.createShader(getSecondaryFragmentSource(), getSecondaryVertexSource(), attributes, uniforms);
		
		const gl = this.context;
		const program = this.secondaryShader.program;

		const loc0 = gl.getUniformLocation(program, "albedo");
		const loc1 = gl.getUniformLocation(program, "normals");
		
		// set which texture units to render with.
		gl.uniform1i(loc0, 0);  // texture unit 0
		gl.uniform1i(loc1, 1);  // texture unit 1
	}
	setCamera (c) {
		this.camera = c;
	}
	setScene (s) {
		this.scene = s;
	}
	setShader (p, s) {
		this.shader = p;
		this.secondaryShader = s; 
	}
	setAtlas (t) {
		this.atlas = t;
		const gl = this.context;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.atlas);
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
		this.createIntermediateFrameBuffer(correctedWidth, correctedHeight);
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

		this.shader.use();
		this.updateSize();

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.intermediate.framebuffer);
		gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2]);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		const cameraMatrix = this.camera.update();
		gl.uniformMatrix4fv(shader.uniforms.camera, false, cameraMatrix.elements);
		gl.uniformMatrix4fv(shader.uniforms.perspective, false, this.camera.perspective.elements);
		

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

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.atlas);

		for (const entity of entities) {
			const entityMatrix = entity.update();

			gl.uniformMatrix4fv(shader.uniforms.entity, false, entityMatrix.elements);

			// texture buffer
			gl.bindBuffer(gl.ARRAY_BUFFER, entity.textureBuffer);
			gl.vertexAttribPointer(shader.attributes.textureBuffer, 3, gl.FLOAT, false, 0, 0);

			// vertex buffer
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, entity.indexBuffer);
			gl.bindBuffer(gl.ARRAY_BUFFER, entity.vertexBuffer);
			gl.vertexAttribPointer(shader.attributes.vertexBuffer, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, entity.normalBuffer);
			gl.vertexAttribPointer(shader.attributes.normalBuffer, 3, gl.FLOAT, false, 0, 0);

			// draw
			gl.drawElements(gl.TRIANGLES, entity.length, gl.UNSIGNED_SHORT, 0);
		}

		gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

		this.secondaryShader.use();

		gl.uniform3fv(this.secondaryShader.uniforms.lightDirection, [light.x, light.y, light.z]);

		// render to the canvas
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// render the cube with the texture we just rendered to
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.intermediate.albedo);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.intermediate.normal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.screenGeometry);
		gl.vertexAttribPointer(this.secondaryShader.attributes.vertexBuffer, 2, gl.FLOAT, false, 0, 0);
		
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}
