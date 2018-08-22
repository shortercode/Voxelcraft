export class Matrix4 {
	constructor () {
		this.elements = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	}

	copy (mat) {
		this.elements[0] = mat.elements[0];
		this.elements[1] = mat.elements[1];
		this.elements[2] = mat.elements[2];
		this.elements[3] = mat.elements[3];
		this.elements[4] = mat.elements[4];
		this.elements[5] = mat.elements[5];
		this.elements[6] = mat.elements[6];
		this.elements[7] = mat.elements[7];
		this.elements[8] = mat.elements[8];
		this.elements[9] = mat.elements[9];
		this.elements[10] = mat.elements[10];
		this.elements[11] = mat.elements[11];
		this.elements[12] = mat.elements[12];
		this.elements[13] = mat.elements[13];
		this.elements[14] = mat.elements[14];
		this.elements[15] = mat.elements[15];

		return this;
	}

	clone () {
		return new Matrix4().copy(this);
	}

	identity () {
		return this.copy(Matrix4.IDENTITY);
	}

	multiply (mat) {
		const a11 = this.elements[ 0 ],
			a12 = this.elements[ 4 ],
			a13 = this.elements[ 8 ],
			a14 = this.elements[ 12 ],

			a21 = this.elements[ 1 ],
			a22 = this.elements[ 5 ],
			a23 = this.elements[ 9 ],
			a24 = this.elements[ 13 ],

			a31 = this.elements[ 2 ],
			a32 = this.elements[ 6 ],
			a33 = this.elements[ 10 ],
			a34 = this.elements[ 14 ],

			a41 = this.elements[ 3 ],
			a42 = this.elements[ 7 ],
			a43 = this.elements[ 11 ],
			a44 = this.elements[ 15 ];

		const b11 = mat.elements[ 0 ],
			b12 = mat.elements[ 4 ],
			b13 = mat.elements[ 8 ],
			b14 = mat.elements[ 12 ],

			b21 = mat.elements[ 1 ],
			b22 = mat.elements[ 5 ],
			b23 = mat.elements[ 9 ],
			b24 = mat.elements[ 13 ],

			b31 = mat.elements[ 2 ],
			b32 = mat.elements[ 6 ],
			b33 = mat.elements[ 10 ],
			b34 = mat.elements[ 14 ],

			b41 = mat.elements[ 3 ],
			b42 = mat.elements[ 7 ],
			b43 = mat.elements[ 11 ],
			b44 = mat.elements[ 15 ];

		this.elements[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		this.elements[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		this.elements[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		this.elements[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		this.elements[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		this.elements[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		this.elements[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		this.elements[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		this.elements[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		this.elements[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		this.elements[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		this.elements[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		this.elements[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		this.elements[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		this.elements[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		this.elements[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;
	}

	compose (position, quaternion, scale) {
		const x2 = quaternion.x + quaternion.x;
		const y2 = quaternion.y + quaternion.y;
		const z2 = quaternion.z + quaternion.z;
		const w2 = quaternion.w + quaternion.w;

		const xx = quaternion.x * x2;
		const xy = quaternion.x * y2;
		const xz = quaternion.x * z2;
		const yy = quaternion.y * y2;
		const yz = quaternion.y * z2;
		const zz = quaternion.z * z2;
		const wx = quaternion.w * x2;
		const wy = quaternion.w * y2;
		const wz = quaternion.w * z2;

		this.elements[0] = (1 - (yy + zz)) * scale.x;
		this.elements[1] = (xy + wz) * scale.x;
		this.elements[2] = (xz - wy) * scale.x;
		this.elements[3] = 0;
		this.elements[4] = (xy - wz) * scale.y;
		this.elements[5] = (1 - (xx + zz)) * scale.y;
		this.elements[6] = (yz + wx) * scale.y;
		this.elements[7] = 0;
		this.elements[8] = (xz + wy) * scale.z;
		this.elements[9] = (yz - wx) * scale.z;
		this.elements[10] = (1 - (xx + yy)) * scale.z;
		this.elements[11] = 0;
		this.elements[12] = position.x;
		this.elements[13] = position.y;
		this.elements[14] = position.z;
		this.elements[15] = 1;

		return this;
	}

	rotate ({x = 0, y = 0, z = 0, w = 1}) {
		const x2 = x + x;
		const y2 = y + y;
		const z2 = z + z;
		const w2 = w + w;

		const xx = x * x2;
		const xy = x * y2;
		const xz = x * z2;
		const yy = y * y2;
		const yz = y * z2;
		const zz = z * z2;
		const wx = w * x2;
		const wy = w * y2;
		const wz = w * z2;

		this.elements[0] = 1 - (yy + zz);
		this.elements[1] = xy + wz;
		this.elements[2] = xz - wy;
		this.elements[3] = 0;
		this.elements[4] = xy - wz;
		this.elements[5] = 1 - (xx + zz);
		this.elements[6] = yz + wx;
		this.elements[7] = 0;
		this.elements[8] = xz + wy;
		this.elements[9] = yz - wx;
		this.elements[10] = 1 - (xx + yy);
		this.elements[11] = 0;
		this.elements[12] = 0;
		this.elements[13] = 0;
		this.elements[14] = 0;
		this.elements[15] = 1;

		return this;
	}

	scale ({x = 1, y = 1, z = 1}) {
		this.elements[0] *= x;
		this.elements[1] *= x;
		this.elements[2] *= x;
		this.elements[3] *= x;
		this.elements[4] *= y;
		this.elements[5] *= y;
		this.elements[6] *= y;
		this.elements[7] *= y;
		this.elements[8] *= z;
		this.elements[9] *= z;
		this.elements[10] *= z;
		this.elements[11] *= z;

		return this;
	}

	position ({x = 0, y = 0, z = 0}) {
		this.elements[12] = -x;
		this.elements[13] = -y;
		this.elements[14] = -z;
	}

	perspective (left, right, top, bottom, near, far) {
		this.elements[ 0 ] = 2 * near / ( right - left );
		this.elements[ 4 ] = 0;
		this.elements[ 8 ] = ( right + left ) / ( right - left );
		this.elements[ 12 ] = 0;
		this.elements[ 1 ] = 0;
		this.elements[ 5 ] = 2 * near / ( top - bottom );
		this.elements[ 9 ] = ( top + bottom ) / ( top - bottom );
		this.elements[ 13 ] = 0;
		this.elements[ 2 ] = 0;
		this.elements[ 6 ] = 0;
		this.elements[ 10 ] = - ( far + near ) / ( far - near );
		this.elements[ 14 ] = - 2 * far * near / ( far - near );
		this.elements[ 3 ] = 0;
		this.elements[ 7 ] = 0;
		this.elements[ 11 ] = - 1;
		this.elements[ 15 ] = 0;

		return this;
	}

	orthograhic (left, right, top, bottom, near, far) {
		throw new Error("Orthographic transform is not implemented");
	}
}

Matrix4.IDENTITY = new Matrix4();
