export function raycast(start, direction, radius, callback) {

	const deltaX = direction.x * radius;
	const deltaY = direction.y * radius;
	const deltaZ = direction.z * radius;

	const destinationX = start.x + deltaX;
	const destinationY = start.y + deltaY;
	const destinationZ = start.z + deltaZ;

	const stepX = direction.x < 0 ? -1 : 1;
	const stepY = direction.y < 0 ? -1 : 1;
	const stepZ = direction.z < 0 ? -1 : 1;

	const startVoxelX = stepX === -1 ? Math.ceil(start.x) : Math.floor(start.x);
	const startVoxelY = stepY === -1 ? Math.ceil(start.y) : Math.floor(start.y);
	const startVoxelZ = stepZ === -1 ? Math.ceil(start.z) : Math.floor(start.z);

	let blocks = [];

	if (deltaX !== 0) {
		// boundary passes for x
		for (let xn = startVoxelX + stepX; true; xn += stepX) {
			const t = (xn - start.x) / deltaX;

			if (t > 1)
				break;

			const yn = start.y + (deltaY * t);
			const zn = start.z + (deltaZ * t);

			blocks.push({
				x: xn,
				y: Math.floor(yn),
				z: Math.floor(zn),
				t: t
			});
		}
	}
	if (deltaY !== 0) {
		// boundary passes for y
		for (let yn = startVoxelY + stepY; true; yn += stepY) {
			const t = (yn - start.y) / deltaY;

			if (t > 1)
				break;

			const xn = start.x + (deltaX * t);
			const zn = start.z + (deltaZ * t);

			blocks.push({
				x: Math.floor(xn),
				y: yn,
				z: Math.floor(zn),
				t: t
			});
		}
	}
	if (deltaZ !== 0) {
		// boundary passes for z
		for (let zn = startVoxelZ + stepZ; true; zn += stepZ) {
			const t = (zn - start.z) / deltaZ;

			if (t > 1)
				break;

			const yn = start.y + (deltaY * t);
			const xn = start.x + (deltaX * t);

			blocks.push({
				x: Math.floor(xn),
				y: Math.floor(yn),
				z: zn,
				t: t
			});
		}
	}
	let previous = Infinity;

	blocks = blocks.sort((a, b) => a.t - b.t).filter(block => {
		const same = block.t === previous;
		previous = block.t;
		return !same;
	});
	// sort based on the t value then pass to callback
	for (const block of blocks) {
		if (callback(block.x, block.y, block.z))
			break;
	}
}
