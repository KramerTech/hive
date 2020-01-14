import { Bug } from "../mechanics/pieceTypes";
import { Piece } from "./piece";
import { Vec } from "../vec";

const ALLOC: {[key: string]: number} = {};
ALLOC[Bug.Q] = 1;
ALLOC[Bug.L] = 1;
ALLOC[Bug.M] = 1;
ALLOC[Bug.B] = 2;
ALLOC[Bug.S] = 2;
ALLOC[Bug.A] = 3;
ALLOC[Bug.G] = 3;

export class PiecePool {

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
					const piece = new Piece(player, bug as Bug);
					piece.update(Vec.ZERO);
					piece.level = -1;
					return piece;
				});
			}
		}
    }

    has(bug: Bug) {
        return this.pools[bug].length > 0;
	}
	
	get(bug: Bug): Piece {
		return this.pools[bug][0];
	}

    use(bug: Bug): Piece {
		return (this.pools[bug].shift() as Piece).clone() as Piece;
	}
	
	bugs(turn: number): Bug[] {
		const bugs: Bug[] = [];
		
		// The bee must be placed by the 4th move
		if (Math.floor(turn / 2) === 3 && this.has(Bug.Q)) { return [Bug.Q]; }

		for (const bug in this.pools) {
			if (this.pools[bug].length > 0) {
				bugs.push(bug as Bug);
			}
		}
		return bugs;
	}

    clone() {
        return new PiecePool(this.player, this.pools);
    }

}