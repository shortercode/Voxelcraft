const textureMap = new Map();

export function getTextureCoords (src) {
	return textureMap.get(src);
}

async function blendTexture (img, texSize, r, g, b) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = texSize;
	canvas.height = texSize;

	r /= 255;
	g /= 255;
	b /= 255;

	ctx.drawImage(img, 0, 0);
	const imageData = ctx.getImageData(0, 0, texSize, texSize);
	const D = imageData.data;
	const length = D.length;
	const n = 1 / 3;

	for (let i = 0; i < length; i += 4) {
		if (D[i + 3] === 0) {
			D[i] = r;
			D[i + 1] = g;
			D[i + 2] = b;
		}
		else {
			const l = (D[i] + D[i + 1] + D[i + 2]) * n;
			D[i] = l * r;
			D[i + 1] = l * g;
			D[i + 2] = l * b;
		}
	}

	ctx.putImageData(imageData, 0, 0);

	return await createImageBitmap(canvas);
}

export async function create3DTexture (gl, images, texSize) {

	images = Array.from(images);
	const depth = images.length;
	const bitmaps = await Promise.all(images.map(src => fetchImage(`textures/${src}.png`)));
	const texture = gl.createTexture();
	const TEX_ARRAY = gl.TEXTURE_2D_ARRAY;
	gl.bindTexture(TEX_ARRAY, texture);

	gl.texImage3D(TEX_ARRAY, 0, gl.RGBA, texSize, texSize, depth, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	for (let i = 0; i < depth; i++) {
		const src = images[i];
		let bitmap = bitmaps[i];

		switch (src) {
			case "grass_top":
			case "leaves_oak":
				bitmap = await blendTexture(bitmap, texSize, 0x87, 0xba, 0x45);
				break;
		}

		gl.texSubImage3D(TEX_ARRAY, 0, 0, 0, i, texSize, texSize, 1, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);

		textureMap.set(src, [
			0, 0, i,
			1, 0, i,
			1, 1, i,
			0, 1, i
		]);
	}

	gl.texParameteri(TEX_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(TEX_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.generateMipmap(TEX_ARRAY);
	gl.bindTexture(TEX_ARRAY, null);

	return texture;
}

async function fetchImage (src) {
	const response = await fetch(src)
	const blob = await response.blob();
	return await createImageBitmap(blob);
}
