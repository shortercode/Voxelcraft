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
		program: program,
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
		"perspective"//,
		// "lightDirection"
	];
}

export function getFragmentSource () {
	return `#version 300 es
		precision highp float;
		layout (location = 0) out vec4 gAlbedo;
		layout (location = 1) out vec4 gNormal;
		layout (location = 2) out vec4 gPosition;

		in vec3 texturePosition;
		in vec4 position;
		in vec3 normal;

		uniform highp sampler2DArray textureSampler;

		void main(void) {
			gAlbedo = texture(textureSampler, texturePosition);
			gNormal = vec4(normal.xyz, 1.0);
			gPosition = position;
		}
	`;
}

export function getVertexSource () {
	return `#version 300 es
		precision highp float;

		in vec3 vertexBuffer;
		in vec3 normalBuffer;
		in vec3 textureBuffer;

		uniform mat4 camera;
		uniform mat4 entity;
		uniform mat4 perspective;
		uniform vec3 lightDirection;

		out vec3 texturePosition;
		out vec4 position;
		out vec3 normal;

		void main(void) {
			position = entity * vec4(vertexBuffer, 1.0) * vec4(0.01, 0.01, 0.01, 1.0);
			gl_Position = perspective * camera * entity * vec4(vertexBuffer, 1.0);
			texturePosition = textureBuffer;
			normal = normalBuffer;
		}
	`;
}

export function getSecondaryVertexSource () {
	return `#version 300 es
		precision highp float;

		in vec3 vertexBuffer;
		// in vec3 lightDirection;
		out vec2 texturePosition;
		// out vec3 light;

		void main(void) {
			gl_Position = vec4(vertexBuffer, 1.0);
			texturePosition = vertexBuffer.xy * 0.5 + 0.5;

		}
	`;
}

export function getSecondaryFragmentSource () {
	return `#version 300 es
		precision highp float;

		in vec2 texturePosition;
		uniform vec3 lightDirection;
		uniform sampler2D albedo;
		uniform sampler2D normals;

		out vec4 outColor;

		vec3 background = vec3(0.0, 0.48, 0.8);

		void main(void) {
					
			// Apply lighting effect

      		highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      		highp vec3 directionalLightColor = vec3(1.0, 1.0, 1.0);

      		highp vec4 normal = texture(normals, texturePosition);

      		highp float directional = max(dot(normal.xyz, lightDirection), 0.0);
			vec3 light = ambientLight + (directionalLightColor * directional);

			vec4 albedoSample = texture(albedo, texturePosition);

			albedoSample = vec4(albedoSample.rgb * light, albedoSample.a);
			albedoSample = vec4(albedoSample.rgb * albedoSample.a + background * ( 1.0 - albedoSample.a ), 1.0);

			outColor = albedoSample;
		}
	`;
}
