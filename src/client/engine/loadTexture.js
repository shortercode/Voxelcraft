const textureMap = new Map();

// export function loadTexture(gl, src) {
// 	let texture = textureMap.get(src);
//
// 	if (texture)
// 		return texture;
//
// 	texture = createTexture(gl, src);
// 	textureMap.set(src, texture);
// 	return texture;
// }
//
// async function createTexture (gl, src) {
// 	const response = await fetch(src);
// 	const blob = await response.blob();
// 	const bitmap = await createImageBitmap(blob);
//
// 	const texture = gl.createTexture();
// 	const TEX_2D = gl.TEXTURE_2D;
//
// 	gl.bindTexture(TEX_2D, texture);
// 	gl.texImage2D(TEX_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
// 	gl.texParameteri(TEX_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
// 	gl.texParameteri(TEX_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_NEAREST);
// 	gl.generateMipmap(TEX_2D);
// 	gl.bindTexture(TEX_2D, null);
//
// 	return texture;
// }

export function getTextureCoords (src) {
	return textureMap.get(src);
}

export async function createAtlas (gl, images, texSize) {
	const bitmaps = await Promise.all(images.map(src => fetchImage(`textures/${src}.png`)));
	const n = Math.ceil(Math.sqrt(images.length));
	// const m = n ** 2;
	const size = texSize * n;
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const coords = [];
	const ln = 1 / n;

	canvas.width = size;
	canvas.height = size;

	ctx.fillRect(0, 0, size, size);

	for (let x = 0, i = 0; x < n; x++) {
		for (let y = 0; y < n; y++, i++) {
			const image = bitmaps[i];
			const src = images[i];
			if (!image)
				break;

			ctx.drawImage(image, x * texSize, y * texSize);

			const x1 = x * ln;
			const y1 = y * ln;
			const x2 = (x + 1) * ln;
			const y2 = (y + 1) * ln;

			textureMap.set(src, [
				x1, y1,
				x2, y1,
				x2, y2,
				x1, y2
			]);
		}
	}

	const atlasBitmap = await createImageBitmap(canvas);

	const texture = gl.createTexture();
	const TEX_2D = gl.TEXTURE_2D;

	gl.bindTexture(TEX_2D, texture);
	gl.texImage2D(TEX_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasBitmap);
	gl.texParameteri(TEX_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(TEX_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
	gl.generateMipmap(TEX_2D);
	gl.bindTexture(TEX_2D, null);

	return texture;
}

async function fetchImage (src) {
	const response = await fetch(src)
	const blob = await response.blob();
	return await createImageBitmap(blob);
}
