export function raycast(start, direction, radius, callback) {
	const dx = direction.x * radius;
	const dy = direction.y * radius;
	const dz = direction.z * radius;
	const ex = start.x + dx;
	const ey = start.y + dy;
	const ez = start.z + dz;
	const stepX = Math.ceil(direction.x);
	const stepY = Math.ceil(direction.y);
	const stepZ = Math.ceil(direction.z);

	const blocks = [];
	// boundary passes for x
	for (let xn = Math.floor(start.x); xn < ex; xn++) {
		const t = (xn - start.x) / dx;
		const yn = start.y + (dy * t);
		const zn = start.z + (dz * t);

		blocks.push({
			x: xn,
			y: Math.floor(yn),
			z: Math.floor(zn),
			t: t
		});
	}
	// boundary passes for y
	for (let yn = Math.floor(start.y); yn < ey; yn++) {
		const t = (yn - start.y) / dy;
		const xn = start.x + (dx * t);
		const zn = start.z + (dz * t);

		blocks.push({
			x: Math.floor(xn),
			y: yn,
			z: Math.floor(zn),
			t: t
		});
	}
	// boundary passes for z
	for (let zn = Math.floor(start.z); zn < ez; zn++) {
		const t = (zn - start.z) / dz;
		const yn = start.y + (dy * t);
		const xn = start.x + (dx * t);

		blocks.push({
			x: Math.floor(xn),
			y: Math.floor(yn),
			z: zn,
			t: t
		});
	}
	// sort based on the t value then pass to callback
	for (const block of blocks.sort((a, b) => a.t - b.t)) {
		if (callback(block.x, block.y, block.z))
			break;
	}
}

//
// function raycast(origin, direction, radius, callback) {
//   // From "A Fast Voxel Traversal Algorithm for Ray Tracing"
//   // by John Amanatides and Andrew Woo, 1987
//   // <http://www.cse.yorku.ca/~amana/research/grid.pdf>
//   // <http://citeseer.ist.psu.edu/viewdoc/summary?doi=10.1.1.42.3443>
//   // Extensions to the described algorithm:
//   //   • Imposed a distance limit.
//   //   • The face passed through to reach the current cube is provided to
//   //     the callback.
//
//   // The foundation of this algorithm is a parameterized representation of
//   // the provided ray,
//   //                    origin + t * direction,
//   // except that t is not actually stored; rather, at any given point in the
//   // traversal, we keep track of the *greater* t values which we would have
//   // if we took a step sufficient to cross a cube boundary along that axis
//   // (i.e. change the integer part of the coordinate) in the variables
//   // tMaxX, tMaxY, and tMaxZ.
//
//   // Cube containing origin point.
//   var x = Math.floor(origin.x + 0.5);
//   var y = Math.floor(origin.y + 0.5);
//   var z = Math.floor(origin.z + 0.5);
//   // Break out direction vector.
//   var dx = direction.x;
//   var dy = direction.y;
//   var dz = direction.z;
//   // Direction to increment x,y,z when stepping.
//   var stepX = signum(dx);
//   var stepY = signum(dy);
//   var stepZ = signum(dz);
//   // See description above. The initial values depend on the fractional
//   // part of the origin.
//   var tMaxX = intbound(origin.x + 0.5, dx);
//   var tMaxY = intbound(origin.y + 0.5, dy);
//   var tMaxZ = intbound(origin.z + 0.5, dz);
//   // The change in t when taking a step (always positive).
//   var tDeltaX = stepX / dx;
//   var tDeltaY = stepY / dy;
//   var tDeltaZ = stepZ / dz;
//   // Buffer for reporting faces to the callback.
//   var face = { x: 0, y: 0, z: 0 };
//
//   // Avoids an infinite loop.
//   if (dx === 0 && dy === 0 && dz === 0)
//     throw new RangeError("Raycast in zero direction!");
//
//   // Rescale from units of 1 cube-edge to units of 'direction' so we can
//   // compare with 't'.
//   radius /= Math.sqrt(dx*dx+dy*dy+dz*dz);
//
//   while (true) {
//
//     // Invoke the callback, unless we are not *yet* within the bounds of the
//     // world.
//     if (callback(x, y, z, face))
//       break;
//
//     // tMaxX stores the t-value at which we cross a cube boundary along the
//     // X axis, and similarly for Y and Z. Therefore, choosing the least tMax
//     // chooses the closest cube boundary. Only the first case of the four
//     // has been commented in detail.
//     if (tMaxX < tMaxY) {
//       if (tMaxX < tMaxZ) {
//         if (tMaxX > radius) break;
//         // Update which cube we are now in.
//         x += stepX;
//         // Adjust tMaxX to the next X-oriented boundary crossing.
//         tMaxX += tDeltaX;
//         // Record the normal vector of the cube face we entered.
//         face.x = -stepX;
//         face.y = 0;
//         face.z = 0;
//       } else {
//         if (tMaxZ > radius) break;
//         z += stepZ;
//         tMaxZ += tDeltaZ;
//         face.x = 0;
//         face.y = 0;
//         face.z = -stepZ;
//       }
//     } else {
//       if (tMaxY < tMaxZ) {
//         if (tMaxY > radius) break;
//         y += stepY;
//         tMaxY += tDeltaY;
//         face.x = 0;
//         face.y = -stepY;
//         face.z = 0;
//       } else {
//         // Identical to the second case, repeated for simplicity in
//         // the conditionals.
//         if (tMaxZ > radius) break;
//         z += stepZ;
//         tMaxZ += tDeltaZ;
//         face.x = 0;
//         face.y = 0;
//         face.z = -stepZ;
//       }
//     }
//   }
// }
//
// function signum(x) {
//   return x > 0 ? 1 : x < 0 ? -1 : 0;
// }
//
// function intbound(s, ds) {
//   // Find the smallest positive t such that s+t*ds is an integer.
//   if (ds < 0) {
//     return intbound(-s, -ds);
//   } else {
//     s = mod(s, 1);
//     // problem is now s+t*ds = 1
//     return (1-s)/ds;
//   }
// }
//
// function mod(value, modulus) {
//   return (value % modulus + modulus) % modulus;
// }
