import { Board } from "../state/board";
import { Vec } from "../vec";
import { Bug } from "./pieceTypes";
import { Piece } from "../state/piece";
import { Slot } from "../state/slot";
import { getBestMove } from "../ai/evaluator";

export class Move {
	constructor(
		public player: number,
		public bug: Bug,
		public dest: Vec,
		public src?: Vec,
	) {}
}

export class Moves {
	static make(board: Board, move: Move): boolean {
		if (move.player !== board.currentPlayer) { return false; }
		
		// Sanity check
		let piece: Piece | undefined;
		if (move.src) {
			piece = board.get(move.src);
		} else {
			piece = board.currentPool().get(move.bug);
		}
		if (!piece) {
			console.log("NO PIECE TO BE MOVED");
			return false;
		}

		let valids;
		if (move.src) {
			// Disjoint graphs check
			if (this.isBridge(board, piece)) {
				console.log("THIS MOVE WOULD BREAK THE HIVE");
				return false;	
			}

			// Find valid moves for the given bug type
			valids = (this as any)[piece.bug](board, piece);
		} else {
			// Or valid places we can put down a new piece
			valids = this.placeable(board);
		}

		if (this.moveValid(move, valids)) {
			board.move(move);
			//const moves = this.getValidMoves(board);
			//console.log(moves.length, moves);

			return true;
		}

		return false;
	}

	static moveValid(move: Move, valids: Vec[]): boolean {
		// return true;

		for (const valid of valids) {
			if (valid.equals(move.dest)) {
				return true;
			}
		}
		return false;
	}

	
	static getValidMoves(board: Board, player?: number): Move[] {
		if (typeof player === undefined) {
			player = board.currentPlayer;
		}
        const moves: Move[] = [];
		board.forEachPiece(piece => {
			if (piece.player !== player) { return; }
			if (this.isBridge(board, piece)) { return; }
			const dests = (this as any)[piece.bug](board, piece) as Vec[];
			moves.push(...dests.map(move => new Move(player || 0, piece.bug, move, piece.axial)));
		});
		const dests = this.placeable(board) as Vec[];

		// TODO: Bee check
		for (const bug of board.currentPool().bugs()) {
			moves.push(...dests.map(move => new Move(player || 0, bug, move)));
		}

		return moves;
	}
	
	/**
	 * Returns true if the one-hive condition prevents this piece from moving
	 * In other words, true if removing this node would create two disjoint graphs
	 */
	static isBridge(board: Board, piece: Piece) {
		if (piece.level > 0) {
			return false;
		}

		const findNext = (idx: number, hasTile: boolean) => {
			for (let i = idx; i < idx+6; i++) {
				const test = Vec.add(piece.axial, Slot.ORDER[i % 6]);
				if (!!board.get(test) === hasTile) {
					return i % 6;
				}
			}
			return -1;
		}

		const firstEmpty = findNext(0, false);
		if (firstEmpty === -1) {
			return false;
		}

		const nextFilled = findNext(firstEmpty + 1, true);
		const nextEmpty = findNext(nextFilled + 1, false);
		const finalFilled = findNext(nextEmpty + 1, true);
		if (finalFilled === nextFilled) {
			return false;
		}

		return true;

	}

	/**
	 * Returns the set of positions where a piece could be validly placed
	 * Valid placement means touching a tile of your color
	 * but no tiles of the opponents' colors
	 */
	static placeable(board: Board): Vec[] {
		const moves: Map<string, Vec> = new Map();

		board.forEachPiece(p => {
			if (p.player === board.currentPlayer) {
				p.forSurrounding(pos => {
					if (board.get(pos)) { return; }
					let flag = false;
					Slot.forSurrounding(pos, bordering => {
						let bp = board.get(bordering)
						if (bp && bp.player !== board.currentPlayer) {
							flag = true;
						}
					});
					if (!flag) {
						moves.set(JSON.stringify(pos), pos);
					}
				});
			}
		});
		return Array.from(moves.values());
	}

	/**
	 * Returns the valid moves of a grasshopper piece
	 * Grasshoppers can jump in a straight line over
	 * 1 or more pieces until the first empty slot
	 */
	static hopper(board: Board, piece: Piece): Vec[] {
		const moves: Vec[] = [];
		piece.forSurrounding((pos, _, dir) => {
			// Need to hop over at least one piece
			if (!board.get(pos)) { return; }

			// Traverse to first blank space
			do { pos.add(dir); }
			while (board.get(pos));

			moves.push(pos);
		});

		return moves;
	}

	static queen(board: Board, piece: Piece): Vec[] {
		const moves: Vec[] = [];
		piece.forSurrounding((pos, i) => {
			if (board.get(pos)) { return; }
			const back = Vec.add(piece.axial, Slot.ORDER[(i + 5) % 6]);
			const forth = Vec.add(piece.axial, Slot.ORDER[(i + 1) % 6]);
			let count = 0;
			if (board.get(back)) { count++; }
			if (board.get(forth)) { count++; }
			if (count === 1) {
				moves.push(pos);
			}
		});
		return moves;
	}

	static lady(board: Board, piece: Piece): Vec[] {
		const moves: Map<string, Vec> = new Map<string, Vec>();
		piece.forSurrounding(pos => {
			const p1 = board.get(pos);
			if (!p1) { return; }
			p1.forSurrounding(pos2 => {
				const p2 = board.get(pos2);
				if (!p2 || p2 === piece) { return; }
				p2.forSurrounding(pos3 => {
					if (!board.get(pos3)) {
						moves.set(JSON.stringify(pos3), pos3);
					}
				})
			});
		})	
		return Array.from(moves.values());
	}

	static spider(board: Board, piece: Piece): Vec[] {
		const moves: Vec[] = [];
		const prevMoves: Set<string> = new Set<string>();
		prevMoves.add(JSON.stringify(piece.axial));
		const active: any[] = [{d: 0, p: piece.axial}];
		while (active.length > 0) {
			const curAct = active.pop();
			const curPos = curAct.p;
			const curMoves: Vec[] = [];
			Slot.forSurrounding(curPos, (pos, i) => {
				if (board.get(pos)) { return; }
				const back = Vec.add(curPos, Slot.ORDER[(i + 5) % 6]);
				const forth = Vec.add(curPos, Slot.ORDER[(i + 1) % 6]);
				let count = 0;
				if (board.get(back) && !back.equals(piece.axial)) { count++ }
				if (board.get(forth) && !forth.equals(piece.axial)) { count++ }
				if (count === 1) {
					curMoves.push(pos);
				}
			});
			curMoves.forEach((move: Vec) => {
				if (!prevMoves.has(JSON.stringify(move))) {
					prevMoves.add(JSON.stringify(move));
					if (curAct.d === 2) {
						moves.push(move);
					} else {
						active.push({d: curAct.d+1, p: move});
					}
				}
			});
		}
		return moves;
	}

	static ant(board: Board, piece: Piece): Vec[] {
		const moves: Vec[] = [];
		const prevMoves: Set<string> = new Set<string>();
		prevMoves.add(JSON.stringify(piece.axial));
		const active: Vec[] = [piece.axial];
		while (active.length > 0) {
			const curPos = active.pop() as Vec;
			const curMoves: Vec[] = [];
			Slot.forSurrounding(curPos, (pos, i) => {
				if (board.get(pos)) { return; }
				const back = Vec.add(curPos, Slot.ORDER[(i + 5) % 6]);
				const forth = Vec.add(curPos, Slot.ORDER[(i + 1) % 6]);
				let count = 0;
				if (board.get(back) && !back.equals(piece.axial)) { count++ }
				if (board.get(forth) && !forth.equals(piece.axial)) { count++ }
				if (count === 1) {
					curMoves.push(pos);
				}
			});
			curMoves.forEach((move: Vec) => {
				if (!prevMoves.has(JSON.stringify(move))) {
					prevMoves.add(JSON.stringify(move));
					moves.push(move);
					active.push(move);
				}
			});
		}
		return moves;
	}

	static mosquito(board: Board, piece: Piece): Vec[] {
		const moves: Map<string, Vec> = new Map();
		const checked: {[key: string]: boolean} = {};

		// Mark mosquito as already checked so we don't get into an infinte loop
		checked[Bug.M] = true;
		
		// For each piece we're touching, acquire that piece's moves
		piece.forSurrounding(pos => {
			const check = board.get(pos);
			if (check && !checked[check.bug]) {
				checked[check.bug] = true;
				const newMoves: Vec[] = (this as any)[check.bug](board, piece);
				newMoves.forEach(m => moves.set(JSON.stringify(m), m))
			}
		});

		// TODO: prune duplicates for when we explore all paths

		return Array.from(moves.values());
	}

	static beetle(board: Board, piece: Piece): Vec[] {
		const moves: Vec[] = [];
		piece.forSurrounding((pos, i) => {
			if (piece.level > 0 || board.get(pos)) {
				moves.push(pos);
				return;
			}
			
			const back = Vec.add(piece.axial, Slot.ORDER[(i + 5) % 6]);
			const forth = Vec.add(piece.axial, Slot.ORDER[(i + 1) % 6]);
			let count = 0;
			if (board.get(back)) { count++; }
			if (board.get(forth)) { count++; }
			if (count === 1) {
				moves.push(pos);
			}
		});
		return moves;
	}

}