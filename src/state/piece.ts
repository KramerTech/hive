import { Bugs } from "../mechanics/pieceTypes";
import { Util } from "../util";
import { Vec } from "../vec";
import { Slot } from "./slot";

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
		Slot.forSurrounding(this.axial, cb);
	}

	equals(other: Piece) {
		return this.axial.equals(other.axial);
	}

	clone() {
		let piece = new Piece(this.player, this.bug);
		piece.artPoint = this.artPoint;
		piece.axial = this.axial;
		return piece;
	}

}