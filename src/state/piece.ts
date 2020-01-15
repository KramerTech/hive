import { Bugs } from "../mechanics/pieceTypes";
import { Util } from "../util";
import { Vec } from "../vec";

export class Piece {

	public parent?: Piece;

	public artPoint = false;
	public visited = false;
	
	public tin!: number;
	public low!: number;

	public cart!: Vec;
	public axial!: Vec;
	public level = 0;
	
	public drag = false;

	public static ORDER = [
		new Vec(1, -1),
		new Vec(1, 0),
		new Vec(0, 1),
		new Vec(-1, 1),
		new Vec(-1, 0),
		new Vec(0, -1),
	];

	static forSurrounding(pos: Vec, cb: (pos: Vec, idx: number, dir: Vec) => boolean | void) {
		let i = 0;
		for (let v of this.ORDER) {
			if (cb(new Vec(pos.x + v.x, pos.y + v.y), i++, v.clone())) {
				return;
			}
		}
	}

	constructor(
		public player: number,
		public bug: Bugs,
	) {
	}

	update(axial: Vec) {
		this.axial = axial;
		this.cart = Util.axialToCartesian(axial);
	}

	forSurrounding(cb: (pos: Vec, idx: number, dir: Vec) => boolean | void) {
		Piece.forSurrounding(this.axial, cb);
	}

	equals(other: Piece) {
		return this.axial.equals(other.axial);
	}

	clone() {
		let newPiece = new Piece(this.player, this.bug);
		newPiece.artPoint = this.artPoint;
		newPiece.axial = this.axial;
		newPiece.level = this.level;

		// Recursively clone stacked pieces
		if (this.parent) {
			newPiece.parent = this.parent.clone();
		}

		return newPiece;
	}

}