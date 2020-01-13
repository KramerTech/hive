import { Util } from "../util";
import { Vec } from "../vec";

export class Polygon {

	static draw(g: CanvasRenderingContext2D, sides: number, top: boolean) {
		g.beginPath();
		g.moveTo(top ? 0 : 1, top ? -1 : 0);
		for (let v = 0; v < sides; v++) {
			let vert = Polygon.vertex(sides, v, top);
			g.lineTo(vert.x, vert.y);
		}
		g.closePath();
	}

	static forEachEdge(
		sides: number,
		top: boolean,
		cb: (vertex: Vec, prev: Vec, idx: number) => void,
	) {
		let prev = Polygon.vertex(sides, sides - 1, top);
		for (let i = 0; i < sides; i++) {
			let vert = Polygon.vertex(sides, i, top);
			cb(vert, prev, i);
			prev = vert;
		}
	}
	
	static vertex(sides: number, side: number, top: boolean): Vec {
		if (top) {
			return new Vec(Math.sin(side * Util.PI2 / sides), -Math.cos(side * Util.PI2 / sides));
		} else {
			return new Vec(Math.cos(side * Util.PI2 / sides), Math.sin(side * Util.PI2 / sides));
		}
	}

	static cross(g: CanvasRenderingContext2D, sides: number, top: boolean, skip: number[] = []) {
		g.beginPath();
		g.moveTo(0, 0);
		for (let v = 0; v <= sides; v++) {
			if (skip.indexOf(v) >= 0) { continue; }
			if (top) {
				g.lineTo(Math.sin(v * Util.PI2 / sides), -Math.cos(v * Util.PI2 / sides));
			} else {
				g.lineTo(Math.cos(v * Util.PI2 / sides), Math.sin(v * Util.PI2 / sides));
			}
			g.moveTo(0, 0);
		}
	}


}