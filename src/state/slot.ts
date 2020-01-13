import { Piece } from "./piece";

export class Slot {

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
        this.stack.push(piece);
    }

    popPiece() {
        return this.stack.pop();
    }

    getLevel() {
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