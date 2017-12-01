export class Vector3 {
	constructor (x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	set (x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	}
	copy ({x = 0, y = 0, z = 0}) {
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	}
	clone () {
		return new Vector3(this.x, this.y, this.z);
	}
	add ({x = 0, y = 0, z = 0}) {
		this.x += x;
		this.y += y;
		this.z += z;

		return this;
	}
	sub ({x = 0, y = 0, z = 0}) {
		this.x -= x;
		this.y -= y;
		this.z -= z;

		return this;
	}
	multiply (s) {
		this.x *= s;
		this.y *= s;
		this.z *= s;

		return this;
	}
	divide (s) {
		const d = 1 / s;

		this.x *= d;
		this.y *= d;
		this.z *= d;

		return this;
	}
	normalise () {
		const d = 1 / this.length();

		this.x *= d;
		this.y *= d;
		this.z *= d;

		return this;
	}
	length () {
		return Math.sqrt(this.x **2 + this.y ** 2 + this.z ** 2);
	}
	lengthSq () {
		return this.x **2 + this.y ** 2 + this.z ** 2;
	}
}

Vector3.UP = new Vector(0, 1, 0);
