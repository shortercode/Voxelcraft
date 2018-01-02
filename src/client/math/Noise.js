/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 // * ES6 style update and instancing added by Iain Shorter
 *
 * Version 2017-30-12
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

import { Vector3 } from "./Vector3.js";

const PERMUTATION = [
	151,160,137,91,90,15,
	131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
	190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
	88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
	77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
	102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
	135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
	5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
	223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
	129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
	251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
	49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
	138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
];

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

const F3 = 1 / 3;
const G3 = 1 / 6;

const GRADIENT = [
	new Vector3(1, 1, 0), new Vector3(-1, 1, 0), new Vector3(1, -1, 0), new Vector3(-1, -1, 0),
	new Vector3(1, 0, 1), new Vector3(-1, 0, 1), new Vector3(1, 0, -1), new Vector3(-1, 0, -1),
	new Vector3(0, 1, 1), new Vector3(0, -1, 1), new Vector3(0, 1, -1), new Vector3(0, -1, -1)
];

export class Noise {
	constructor (seed = 0) {

		this.permutation = new Array(512);
		this.gradient = new Array(512);

		if (seed > 0 && seed < 1) {
	    // Scale the seed out
	    seed *= 65536;
	  }

	  seed = Math.floor(seed);
	  if (seed < 256) {
	    seed |= seed << 8;
	  }

	  for ( let i = 0; i < 256; i++ ) {
			let v = PERMUTATION[i];

			v ^= (i & 1 ? seed : seed >> 8) & 255

	    this.permutation[i] = this.permutation[i + 256] = v;
	    this.gradient[i] = this.gradient[i + 256] = GRADIENT[v % 12];
	  }
	}
	simplex2(xin, yin) {
		// Noise contributions from the three corners
	  let n0 = 0;
		let n1 = 0;
		let n2 = 0;

	  // Skew the input space to determine which simplex cell we're in
	  const s = ( xin + yin ) * F2; // Hairy factor for 2D
		let i = Math.floor( xin + s );
	  let j = Math.floor( yin + s );
	  const t = ( i + j ) * G2;

		// The x,y distances from the cell origin, unskewed.
		const v0 = {
			x: xin - i + t,
			y: yin - j + t
		};
	  // For the 2D case, the simplex shape is an equilateral triangle.
	  // Determine which simplex we are in.
	  let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
	  if (v0.x > v0.y) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
	    i1 = 1;
			j1 = 0;
	  } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
	    i1 = 0;
			j1 = 1;
	  }
	  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
	  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
	  // c = (3-sqrt(3))/6
		// Offsets for middle corner in (x,y) unskewed coords
		const v1 = {
			x: v0.x - i1 + G2,
		  y: v0.y - j1 + G2
		};
		const v2 = {
			x: v0.x - 1 + 2 * G2,
			y: v0.y - 1 + 2 * G2
		};

	  // Work out the hashed gradient indices of the three simplex corners
	  i &= 255;
	  j &= 255;

	  // Calculate the contribution from the three corners
	  let t0 = 0.5 - v0.x ** 2 - v0.y ** 2;
	  if (t0 >= 0) {
			const gi0 = this.gradient[i + this.permutation[j]];
	    t0 *= t0;
	    n0 = t0 * t0 * gi0.dot2(v0);  // (x,y) of grad3 used for 2D gradient
	  }

	  let t1 = 0.5 - v1.x ** 2 - v1.y ** 2;
	  if ( t1 >= 0 ) {
			const gi1 = this.gradient[i + i1 + this.permutation[j + j1]];
	    t1 *= t1;
	    n1 = t1 * t1 * gi1.dot2(v1);
	  }

	  let t2 = 0.5 - v2.x ** 2 - v2.y ** 2;
	  if ( t2 >= 0 ) {
			const gi2 = this.gradient[i + 1 + this.permutation[j + 1]];
	    t2 *= t2;
	    n2 = t2 * t2 * gi2.dot2(v2);
	  }
	  // Add contributions from each corner to get the final noise value.
	  // The result is scaled to return values in the interval [0,1].
	  return (35 * (n0 + n1 + n2)) + 0.5;
	}
}