import { Piece } from "./piece";
import { Vec } from "../vec";

export class Slot {

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
		for (let v of Slot.ORDER) {
			if (cb(new Vec(pos.x + v.x, pos.y + v.y), i++, v.clone())) {
				return;
			}
		}
	}

	public stack: Piece[] = [];

    constructor() {}

    hasPiece() {
        return this.stack.length > 0;
    }

    getTop(): Piece | undefined {
        return this.stack[this.stack.length - 1];
    }

    getBottom() {
        return this.stack[0];
    }

    pushPiece(piece: Piece) {
		piece.level = this.stack.length;
        this.stack.push(piece);
    }

    popPiece() {
        return this.stack.pop();
    }

    size() {
        return this.stack.length;
    }

    clone() {
		const slot = new Slot();
		for (const piece of this.stack) {
			slot.stack.push(piece);
		}
        return slot;
    }
}