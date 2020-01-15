import { Board } from "../state/board";
import { Vec } from "../vec";
import { Bugs } from "./pieceTypes";
import { Piece } from "../state/piece";
import { Slot } from "../state/slot";
import { Env } from "../state/env";
import { getBestMove } from "../ai/evaluator";
import { PieceMoves } from "./pieceMoves";

export class Move {
	constructor(
		public player: number,
		public bug: Bugs,
		public dest: Vec,
		public src?: Vec,
	) {}
}

export class Moves {

	static FIRST_MOVE = [new Vec()];

	static make(board: Board, move: Move, human?: boolean): boolean {
		if (move.player !== board.currentPlayer) { return false; }
		
		// Sanity check
		let piece: Piece | undefined;
		if (move.src) {
			piece = board.get(move.src);
		} else {
			piece = board.currentPool().get(move.bug);
		}
		if (!piece) {
			console.log(move.src ? "Pool does not contain a " + move.bug : "No piece at source " + move.src);
			return false;
		}

		let valids;
		if (move.src) {
			// Disjoint graphs check
			// Can safely be ignored if moving a stacked piece
			if (piece.level === 0 && Env.validate && piece.artPoint) {
				console.log("Hive break");
				return false;	
			}

			// Find valid moves for the given bug type
			valids = PieceMoves.get(board, piece);
		} else {
			// Or valid places we can put down a new piece
			valids = this.getPlaceable(board);
		}

		if (!Env.validate || this.moveValid(move, valids)) {
			board.applyMove(move);
			
			// TODO Check gameover

			// TODO: cache allmoves to avoid double work for evaluator
			const allMoves = this.getAllMoves(board);

			if (allMoves.length === 0) {
				console.log("No moves for", board.currentPlayer ? "black" : "white");
				board.nextTurn();
			} else if (human) {
				// console.log(this.getAllMoves(board));
				// console.log("AI Moving");
				// this.make(board, getBestMove(board, allMoves.length > 42 ? 2 : 3));
			}

			return true;
		} else {
			console.log("Invalid", move.src ? "move" : "placement");
		}

		return false;
	}

	static moveValid(move: Move, valids: Vec[]): boolean {
		for (const valid of valids) {
			if (move.dest.equals(valid)) {
				return true;
			}
		}
		return false;
	}
	
	static getAllMoves(board: Board, player = board.currentPlayer): Move[] {
		const moves: Move[] = [];

		// We cannot move pieces until our bee is down
		if (board.beeDown(player)) {
			// Get all moves for every piece
			board.forEachTop(piece => {
				// Not your turn
				if (piece.player !== player) { return; }
				// Breaks the hive
				if (piece.artPoint) { return; }

				const dests = PieceMoves.get(board, piece);
				moves.push(...dests.map(move => new Move(player, piece.bug, move, piece.axial)));
			});
		}

		const dests = this.getPlaceable(board, player) as Vec[];
		for (const bug of board.currentPool().bugs(board.turn)) {
			moves.push(...dests.map(move => new Move(player, bug, move)));
		}

		return moves;
	}

	/**
	 * Returns the set of positions where a piece could be validly placed
	 * Valid placement means touching a tile of your color
	 * but no tiles of the opponents' colors
	 */
	static getPlaceable(board: Board, player = board.currentPlayer): Vec[] {
		if (board.turn === 0) {
			return Moves.FIRST_MOVE;
		} else if (board.turn === 1) {
			return Slot.ORDER;
		}

		const moves: Map<string, Vec> = new Map();

		board.forEachTop(p => {
			if (p.player === player) {
				p.forSurrounding(pos => {
					if (board.get(pos)) { return; }
					let flag = false;
					Slot.forSurrounding(pos, bordering => {
						let bp = board.get(bordering)
						if (bp && bp.player !== player) {
							flag = true;
						}
					});
					if (!flag) {
						moves.set(pos.x + pos.y * 10000 + '', pos);
					}
				});
			}
		});
		return Array.from(moves.values());
	}

}

(window as any).moves = Moves;