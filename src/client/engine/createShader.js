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
		// program: program,
		attributes: attributeMap,
		uniforms: uniformMap
	};
}

export function getAttributes () {
	return [
		"vertexBuffer",
		"textureBuffer",
		"normalBuffer"
	];
}

export function getUniforms () {
	return [
		"camera",
		"entity",
		"texture",
		"perspective",
		"lightDirection"
	];
}

export function getFragmentSource () {
	return `#version 300 es
		precision highp float;

		in vec3 texturePosition;
		in vec3 light;
		in vec4 position;
		in vec3 normal;

		uniform highp sampler2DArray textureSampler;

		out vec4 outColor;

		void main(void) {
			vec4 texelColor = texture(textureSampler, texturePosition);
			outColor = vec4(texelColor.rgb * light, texelColor.a);
		}
	`;
}

export function getVertexSource () {
	return `#version 300 es
		precision highp float;

		layout(location = 0) in vec3 vertexBuffer;
		layout(location = 1) in vec3 normalBuffer;
		layout(location = 2) in vec3 textureBuffer;

		uniform mat4 camera;
		uniform mat4 perspective;
		uniform vec3 lightDirection;

		out vec3 texturePosition;
		out vec3 light;

		void main(void) {
			gl_Position = perspective * camera * vec4(vertexBuffer, 1.0);
			texturePosition = textureBuffer;

			vec3 ambientLight = vec3(0.4, 0.4, 0.4);
      		vec3 directionalLightColor = vec3(1, 1, 1);
      		vec4 transformedNormal = vec4(normalBuffer, 1.0);
      		float directional = max(dot(transformedNormal.xyz, lightDirection), 0.0);
      		light = ambientLight + (directionalLightColor * directional);
		}
	`;
}
