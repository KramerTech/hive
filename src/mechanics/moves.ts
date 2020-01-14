import { Board } from "../state/board";
import { Vec } from "../vec";
import { Bug } from "./pieceTypes";
import { Piece } from "../state/piece";
import { Slot } from "../state/slot";
import { Env } from "../state/env";

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
			if (Env.validate && piece.artPoint) {
				console.log("THIS MOVE WOULD BREAK THE HIVE");
				return false;	
			}

			// Find valid moves for the given bug type
			valids = this.getPieceMoves(board, piece);
		} else {
			// Or valid places we can put down a new piece
			valids = this.placeable(board);
		}

		if (!Env.validate || this.moveValid(move, valids)) {
			board.move(move);
			
			//const moves = this.getAllMoves(board);
			//console.log(moves.length, moves);

			return true;
		}

		return false;
	}

	static moveValid(move: Move, valids: Vec[]): boolean {
		for (const valid of valids) {
			if (valid.equals(move.dest)) {
				return true;
			}
		}
		return false;
	}

	static getPieceMoves(board: Board, piece: Piece, bug: Bug = piece.bug): Vec[] {
		return (this as any)[bug](board, piece) as Vec[];
	}
	
	static getAllMoves(board: Board, player = board.currentPlayer): Move[] {
		const moves: Move[] = [];
		if (Math.floor(board.turn / 2) === 3 && board.currentPool().has(Bug.Q)) {
			const dests = this.placeable(board) as Vec[];
			moves.push(...dests.map(move => new Move(player, Bug.Q, move)));
			console.log(moves);
			return moves;
		}

		board.forEachPiece(piece => {
			if (piece.player !== player) { return; }
			if (piece.artPoint) { return; }
			const dests = this.getPieceMoves(board, piece);
			moves.push(...dests.map(move => new Move(player, piece.bug, move, piece.axial)));
		});
		const dests = this.placeable(board) as Vec[];

		// TODO: Bee check
		for (const bug of board.currentPool().bugs()) {
			moves.push(...dests.map(move => new Move(player, bug, move)));
		}

		return moves;
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
		if (piece.level > 0) {
			return this.beetle(board, piece);
		}

		const moves: Map<string, Vec> = new Map();
		const checked: {[key: string]: boolean} = {};

		// Mark mosquito as already checked so we don't get into an infinte loop
		checked[Bug.M] = true;
		
		// For each piece we're touching, acquire that piece's moves
		piece.forSurrounding(pos => {
			const check = board.get(pos);
			if (check && !checked[check.bug]) {
				checked[check.bug] = true;
				const newMoves = this.getPieceMoves(board, piece, check.bug);
				newMoves.forEach(m => moves.set(m.toString(), m));
			}
		});

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