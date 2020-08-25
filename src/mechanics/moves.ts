import { Board } from "../state/board";
import { Piece } from "../state/piece";
import { Vec } from "../vec";
import { PieceMoves } from "./pieceMoves";
import { Bugs } from "./pieceTypes";

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

	static make(board: Board, move: Move): boolean {
		if (move.player !== board.currentPlayer || board.winner !== undefined) {
			return false;
		}
		
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
			board.applyMove(move);
			const allMoves = this.getAllMoves(board);
			if (allMoves.length === 0) {
				board.nextTurn();
			}
			return true;
			
			// if (human) {
			// 	// console.log(this.getAllMoves(board));
			// 	console.log("AI Moving");
			// 	this.make(board, getBestMoveSparse(board, 5, 4));
			// 	//this.make(board, getBestMove(board, 3));
			// }
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
			// First move is always at 0, 0
			return Moves.FIRST_MOVE;
		} else if (board.turn === 1) {
			// Second move must touch opponent piece
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

	static makeRandomMove(board: Board): Move | undefined {
		const moves = this.getAllMoves(board);
		if (moves.length) {
			const move = moves[Math.floor(Math.random() * moves.length)];
			this.make(board, move);
			return move;
		}
	}

}