/*
  Modified form of algorithm found @ https://stackoverflow.com/questions/16505905/walk-a-line-between-two-points-in-a-3d-voxel-space-visiting-all-cells
  by https://stackoverflow.com/users/441352/wivlaro
*/
export function raycast(v0, v1, visitor) {

  // performed before the rounding
  const vx = v1.x === v0.x ? 1 : v1.x - v0.x;
  const vy = v1.y === v0.y ? 1 : v1.y - v0.y;
  const vz = v1.z === v0.z ? 1 : v1.z - v0.z;

  const x0 = Math.floor(v0.x);
  const y0 = Math.floor(v0.y);
  const z0 = Math.floor(v0.z);
  const x1 = Math.floor(v1.x);
  const y1 = Math.floor(v1.y);
  const z1 = Math.floor(v1.z);

  const sx = x1 > x0 ? 1 : x1 < x0 ? -1 : 0;
  const sy = y1 > y0 ? 1 : y1 < y0 ? -1 : 0;
  const sz = z1 > z0 ? 1 : z1 < z0 ? -1 : 0;

  const gxp = x0 + (x1 > x0 ? 1 : 0);
  const gyp = y0 + (y1 > y0 ? 1 : 0);
  const gzp = z0 + (z1 > z0 ? 1 : 0);

  const vxvy = vx * vy;
  const vxvz = vx * vz;
  const vyvz = vy * vz;

  const derrx = sx * vyvz;
  const derry = sy * vxvz;
  const derrz = sz * vxvy;

  let errx = (gxp - x0) * vyvz;
  let erry = (gyp - y0) * vxvz;
  let errz = (gzp - z0) * vxvy;

  let gx = x0;
  let gy = y0;
  let gz = z0;

	let px = gx;
	let py = gy;
	let pz = gz;

	// first block could be returned here, but we skip

  while (gx !== x1 || gy !== y1 || gz !== z1) {

    const xr = Math.abs(errx);
    const yr = Math.abs(erry);
    const zr = Math.abs(errz);

    if (sx !== 0 && (sy === 0 || xr < yr) && (sz === 0 || xr < zr)) {
      gx += sx;
      errx += derrx;
    }
    else if (sy !== 0 && (sz === 0 || yr < zr)) {
      gy += sy;
      erry += derry;
    }
    else if (sz !== 0) {
      gz += sz;
      errz += derrz;
    }

    if (visitor(gx, gy, gz, px, py, pz))
      break;

		px = gx;
		py = gy;
		pz = gz;
  }
}
