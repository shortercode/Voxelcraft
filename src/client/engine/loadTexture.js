const textureMap = new Map();

export function loadTexture(gl, src) {
	let texture = textureMap.get(src);

	if (texture)
		return texture;

	texture = createTexture(gl, src);
	textureMap.set(src, texture);
	return texture;
}

async function createTexture (gl, src) {
	const response = await fetch(src);
	const blob = await response.blob();
	const bitmap = await createImageBitmap(blob);

	const texture = gl.createTexture();
	const TEX_2D = gl.TEXTURE_2D;

	gl.bindTexture(TEX_2D, texture);
	gl.texImage2D(TEX_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
	gl.texParameteri(TEX_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(TEX_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(TEX_2D);
	gl.bindTexture(TEX_2D, null);

	return texture;
}
