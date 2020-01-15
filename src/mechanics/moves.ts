import { Board } from "../state/board";
import { Piece } from "../state/piece";
import { Vec } from "../vec";
import { PieceMoves } from "./pieceMoves";
import { Bugs } from "./pieceTypes";
import { getBestMoveSparse } from "../ai/evaluator";

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
			// Find valid moves for the given bug type
			valids = PieceMoves.get(board, piece);
		} else {
			// Or valid places we can put down a new piece
			valids = this.getPlaceable(board);
		}

		if (this.moveValid(move, valids)) {
			if (board.applyMove(move)) {
				console.log("Game Over", board.winner);
				return true;
			};
			
			// TODO: cache allmoves to avoid double work for evaluator
			const allMoves = this.getAllMoves(board);

			if (allMoves.length === 0) {
				console.log("No moves for", board.currentPlayer ? "black" : "white");
				board.nextTurn();
			} else if (human) {
				// console.log(this.getAllMoves(board));
				console.log("AI Moving");
				this.make(board, getBestMoveSparse(board, 5, 4));
				//this.make(board, getBestMove(board, 3));
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

		if (board.winner) { return moves; }

		// Get all moves for every piece
		board.forEachTop(piece => {
			// Not your turn
			if (piece.player !== player) { return; }
			const dests = PieceMoves.get(board, piece);
			moves.push(...dests.map(move => new Move(player, piece.bug, move, piece.axial)));
		});

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
			return Piece.ORDER;
		}

		const moves: Map<string, Vec> = new Map();

		// Get all slots touching my pieces
		board.forEachTop(piece => {
			if (piece.player !== player) { return; }
			board.forSurroundingSlots(piece.axial, pos => {
				moves.set(pos.toString(), pos);
			});
		});

		// Remove all slots touching your pieces
		board.forEachTop(piece => {
			if (piece.player === player) { return; }
			board.forSurroundingSlots(piece.axial, pos => {
				moves.delete(pos.toString());
			});
		});

		return Array.from(moves.values());
	}

}

(window as any).moves = Moves;