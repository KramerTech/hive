import { Board } from "../state/board";
import { Vec } from "../vec";
import { Bug } from "./pieceTypes";
import { Game } from "../state/game";

export class Move {
	constructor(
		public player: number,
		public bug: Bug,
		public dest: Vec,
		public src?: Vec,
	) {}
}

export class Moves {

	static make(game: Game, move: Move): boolean {
		// if (move.player !== game.currentPlayer) { return false; }
		const board = game.board;
		
		if (board.get(move.dest)) { return false; }
		board.set(move.dest, board.get(move.src));
		if (move.src) {
			board.set(move.src, undefined);
		}

		return true;
	}

	static placeable(board: Board): Move[] {
		const moves: Move[] = [];

		return moves;
	}

	static hopper(board: Board, src: Vec): Move[] {
		const moves: Move[] = [];

		return moves;
	}


}