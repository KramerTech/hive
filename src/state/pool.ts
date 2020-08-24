import { Bugs } from "../mechanics/pieceTypes";
import { Piece } from "./piece";
import { Vec } from "../vec";
import { Var } from "./var";

const ALLOC: {[key: string]: number} = {};
ALLOC[Bugs.QUEEN] = 1;
ALLOC[Bugs.LADY] = 1;
ALLOC[Bugs.MOSQUITO] = 1;
ALLOC[Bugs.BEETLE] = 2;
ALLOC[Bugs.SPIDER] = 2;
ALLOC[Bugs.ANT] = 3;
ALLOC[Bugs.HOPPER] = 3;

export class PiecePool {

	public static TOTAL = function() {
		let sum = 0;
		for (const count of Object.values(ALLOC)) { sum += count; }
		return sum;
	}();

	public pools: {[key: string]: Piece[]} = {}

    constructor(
		public player: number,
		poolsClone?: {[key: string]: Piece[]},
	) {
		if (poolsClone) {
			for (const bug in poolsClone) {
				this.pools[bug] = poolsClone[bug].slice(0);
			}
		} else {
			for (const bug in ALLOC) {
				this.pools[bug] = new Array(ALLOC[bug]).fill(1).map(() => {
					const piece = new Piece(player, bug as Bugs);
					piece.update(Vec.ZERO);
					piece.level = -1;
					return piece;
				});
			}
		}
    }

    has(bug: Bugs) {
        return this.pools[bug].length > 0;
	}
	
	get(bug: Bugs): Piece {
		return this.pools[bug][0];
	}

    use(bug: Bugs): Piece {
		return (this.pools[bug].shift() as Piece).clone() as Piece;
	}
	
	bugs(turn: number): Bugs[] {
		const bugs: Bugs[] = [];
		
		// The bee must be placed by the 4th move
		if (Math.floor(turn / 2) >= Var.BEE_DOWN_BY - 1 && this.has(Bugs.QUEEN)) { return [Bugs.QUEEN]; }

		for (const bug in this.pools) {
			if (this.pools[bug].length > 0) {
				bugs.push(bug as Bugs);
			}
		}
		return bugs;
	}

    clone() {
        return new PiecePool(this.player, this.pools);
    }

}