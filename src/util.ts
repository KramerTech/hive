import { Vec } from "./vec";

interface Equatable { equals(other: Equatable): boolean; }

export class Util {

	static PI2 = Math.PI * 2;
	static SQR3 = Math.sqrt(3);
	static HEX_HEIGHT = Util.SQR3 / 2;
	static HEX_UP = new Vec(-0.5, Util.HEX_HEIGHT);
	static HEX_DOWN = new Vec(0.5, Util.HEX_HEIGHT);

	static degToRad(deg: number): number {
		return deg * Math.PI / 180;
	}

	static indexOf(array: Equatable[], find: Equatable): number {
		for (let i = 0; i < array.length; i++) {
			if (find.equals(array[i])) { return i; }
		}
		return -1;
	}

	static axialToCartesian(axial: Vec): Vec {
		return new Vec(
			axial.x * 3 / 2,
			Util.SQR3 * (axial.x / 2 + axial.y),
		);
	}
	
	public static cartesianToAxial(cart: Vec): Vec {
		let axial = new Vec(
			cart.x * 2 / 3,
			(Util.SQR3 * cart.y - cart.x) / 3
		);
		axial.round();

		let centered = Util.axialToCartesian(axial);

		// Bottom Left Half
		if (Util.HEX_DOWN.cross(Vec.sub(cart, centered)) > 0) {
			// Below bottom line
			if (cart.y > centered.y + Util.HEX_HEIGHT) {
				axial.y++;
			} 
			// Left of diagonal
			else if (Util.HEX_UP.cross(Vec.sub(cart, centered).add(Util.HEX_DOWN)) > 0) {
				axial.x--;
			}
		} 

		// Top Right Half
		else {
			// Above top line
			if (cart.y < centered.y - Util.HEX_HEIGHT) {
				axial.y--;
			}
			// Right of diagonal
			else if (Util.HEX_UP.cross(Vec.sub(cart, centered).sub(Util.HEX_DOWN)) < 0) {
				axial.x++;
			}
		}

		return axial;
	}

}