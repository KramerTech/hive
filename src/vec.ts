
export class Vec {

	// For use with clamps / mins / maxes
	// Does not include prototype functions
	// to help discourage alteration
	static ZERO: Vec = <Vec> {x: 0, y: 0};

	constructor (
		public x: number = 0,
		public y: number = 0,
	) {
		this.set(x, y);
	}

	static equals(a?: Vec, b?: Vec) {
		if (a === undefined || b === undefined) { return false; }
		return a.equals(b);
	}

	static add(a: Vec, b: Vec): Vec { return new Vec(a.x + b.x, a.y + b.y); }
	static addScalar(vec: Vec, s: number) { return vec.clone().addScalar(s); }

	static sub(a: Vec, b: Vec): Vec { return new Vec(a.x - b.x, a.y - b.y); }
	static subScalar(vec: Vec, s: number) { return vec.clone().subScalar(s); }

	static mult(vec: Vec, scale: number): Vec { return new Vec(vec.x * scale, vec.y * scale); }

	static div(vec: Vec, scale: number): Vec { return new Vec(vec.x / scale, vec.y / scale); }

	static dist(a: Vec, b: Vec): number { return Math.sqrt(Vec.distSq(a, b)); }

	static distSq(a: Vec, b: Vec): number { return Vec.sq(b.x - a.x) + Vec.sq(b.y - a.y); }

	static mag(x: number, y: number) { return Math.sqrt(x * x + y * y); }

	static magSq(x: number, y: number) { return x * x + y * y; }

	static normalize(vec: Vec): Vec { return vec.clone().normalize(); }

	static min(a: Vec, b: Vec): Vec { return a.clone().min(b); }
	static max(a: Vec, b: Vec): Vec { return a.clone().max(b); }
	static floor(vec: Vec): Vec { return vec.clone().floor(); }
	static ceil(vec: Vec): Vec { return vec.clone().ceil(); }
	static clamp(vec: Vec, low: Vec, high: Vec): Vec { return vec.clone().clamp(low, high); }

	static sq(val: number) { return val * val; }

	static scale(vec: Vec, scale: number): Vec { return Vec.normalize(vec).mult(scale); }

	static round(vec: Vec) { return vec.clone().round(); }

	static cross(a: Vec, b: Vec): number { return a.cross(b); }

	static invert(vec: Vec): Vec { return vec.clone().mult(-1); }

	static toPolar(vec: Vec): Vec { return vec.clone().toPolar(); }

	static toCartesian(vec: Vec): Vec { return vec.clone().toCartesian(); }

	static fromAngle(angle: number): Vec { return new Vec(Math.cos(angle), Math.sin(angle)); }

	static rotate(vec: Vec, rad: number): Vec { return vec.clone().rotate(rad); }

	static fromData(vec: any): Vec | undefined {
		if (!vec || isNaN(vec.x) || isNaN(vec.y)) { return; }
		return new Vec(vec.x, vec.y);
	}

	clone(): Vec { return new Vec(this.x, this.y); }
	equals(vec: Vec) { return this.x === vec.x && this.y === vec.y; }

	set(vec: Vec): Vec;
	set(x: number, y: number): Vec;
	set(xOrVec: number | Vec, y?: number): Vec {
		if (typeof xOrVec === "number") {
			this.x = xOrVec;
			this.y = <number> y;
		} else {
			this.x = xOrVec.x;
			this.y = xOrVec.y;
		}
		return this;
	}

	add(vec: Vec): Vec;
	add(x: number, y: number): Vec;
	add(xOrVec: number | Vec, y?: number): Vec {
		if (typeof xOrVec === "number") {
			this.x += xOrVec;
			this.y += <number> y;
		} else {
			this.x += xOrVec.x;
			this.y += xOrVec.y;
		}
		return this;
	}
	addScalar(scale: number) {
		this.x += scale;
		this.y += scale;
		return this;
	}

	sub(vec: Vec): Vec;
	sub(x: number, y: number): Vec;
	sub(xOrVec: number | Vec, y?: number): Vec {
		if (typeof xOrVec === "number") {
			this.x -= xOrVec;
			this.y -= <number> y;
		} else {
			this.x -= xOrVec.x;
			this.y -= xOrVec.y;
		}
		return this;
	}
	subScalar(scale: number) {
		this.x -= scale;
		this.y -= scale;
		return this;
	}

	floor(): Vec {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}

	ceil(): Vec {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}

	min(vec: Vec) { this.x = Math.min(this.x, vec.x); this.y = Math.min(this.y, vec.y); return this; }
	max(vec: Vec) { this.x = Math.max(this.x, vec.x); this.y = Math.max(this.y, vec.y); return this; }

	clamp(low: Vec, high: Vec): Vec;
	clamp(low: number, high: number): Vec;
	clamp(low: number | Vec, high: number | Vec): Vec {
		let xl; let yl; let xh; let yh;
		if (typeof low === "number") {
			if (typeof high !== "number") {
				throw new Error("Invalid call signature");
			}
			xl = yl = low;
			xh = yh = high;
		} else {
			if (typeof high === "number") {
				throw new Error("Invalid call signature");
			}
			xl = low.x;
			xh = high.x;
			yl = low.y;
			yh = high.y;
		}
		this.x = Math.max(xl, Math.min(this.x, xh));
		this.y = Math.max(yl, Math.min(this.y, yh));
		return this;
	}

	angle(): number { return Math.atan2(this.y, this.x); }

	abs(): Vec { this.x = Math.abs(this.x); this.y = Math.abs(this.y); return this; }
	round(): Vec { this.x = Math.round(this.x); this.y = Math.round(this.y); return this; }
	mult(scale: number): Vec { this.x *= scale; this.y *= scale; return this; }
	div(scale: number): Vec { this.x /= scale; this.y /= scale; return this; }
	dist(vec: Vec): number { return Math.sqrt(this.distSq(vec)); }
	distSq(vec: Vec): number { if (!vec) { return 0; } return Vec.sq(vec.x - this.x) + Vec.sq(vec.y - this.y); }
	mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
	magSq() { return (this.x * this.x + this.y * this.y); }
	normalize(): Vec { const mag = this.mag(); this.x /= mag; this.y /= mag; return this; }
	scale(length: number) { return this.normalize().mult(length); }
	dot(vec: Vec) { return this.x * vec.x + this.y * vec.y; }
	cross(vec: Vec): number { return this.x * vec.y - this.y * vec.x; }
	invert(): Vec { return this.mult(-1); }
	zero(): Vec { this.x = 0; this.y = 0; return this; }

	rotate(rad: number): Vec {
		let x = this.x * Math.cos(rad) + this.y * Math.sin(rad);
		let y = this.y * Math.cos(rad) - this.x * Math.sin(rad);
		this.x = x; this.y = y;
		return this;
	}
	
	toPolar(): Vec {
		const r = this.mag();
		this.y = Math.atan2(this.y, this.x);
		this.x = r;
		return this;
	}
	toCartesian(): Vec {
		const r = this.x;
		const theta = this.y;
		this.x = r * Math.cos(theta);
		this.y = r * Math.sin(theta);
		return this;
	}

	isZero(): boolean { return this.x === 0 && this.y === 0; }
	eitherIsZero(): boolean { return this.x === 0 || this.y === 0; }

	toString(): string {
		return this.x + " " + this.y;
	}

	index(size: number) {
		return this.x + this.y * size;
	}

}
