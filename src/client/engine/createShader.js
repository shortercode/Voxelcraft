function compile (gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw log;
	}
	return shader;
}

function createProgram (gl, vertex, fragment) {
	const shader = gl.createProgram();
	gl.attachShader(shader, fragment);
	gl.attachShader(shader, vertex);
	gl.linkProgram(shader);
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(shader);
		gl.deleteProgram(shader);
		throw log;
	}
	gl.useProgram(shader);
	const log = gl.getProgramInfoLog(shader);
	if (log)
		console.info(log);
	return shader;
}

export function createShader (gl, fragmentSource, vertexSource, attributes, uniforms) {
	const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
	const program = createProgram(gl, vertex, fragment);

	const attributeMap = {};
	const uniformMap = {};

	for (const attribute of attributes) {
		attributeMap[attribute] = gl.getAttribLocation(program, attribute);
		gl.enableVertexAttribArray(attributeMap[attribute]);
	}

	for (const uniform of uniforms) {
		uniformMap[uniform] = gl.getUniformLocation(program, uniform);
	}

	return {
		use: () => gl.useProgram(program),
		attributes: attributeMap,
		uniforms: uniformMap
	};
}

export function getAttributes () {
	return [
		"vertexBuffer",
		"textureBuffer"
	];
}

export function getUniforms () {
	return [
		"camera",
		"entity",
		"texture",
		"perspective"
	];
}

export function getFragmentSource () {
	return `
		varying highp vec2 texturePosition;
		uniform sampler2D texture;

		void main(void) {
			highp vec4 texelColor = texture2D(texture, vec2(texturePosition.s, texturePosition.t));
			gl_FragColor = vec4(texelColor.rgb * 1.0, texelColor.a);
		}
	`;
}

export function getVertexSource () {
	return `
		attribute vec3 vertexBuffer;
		attribute vec2 textureBuffer;

		uniform mat4 camera;
		uniform mat4 entity;
		uniform mat4 perspective;

		varying highp vec2 texturePosition;

		void main(void) {
			gl_Position = perspective * camera * entity * vec4(vertexBuffer, 1.0);
			texturePosition = textureBuffer;
		}
	`;
}
