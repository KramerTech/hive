import { Board } from "../state/board";
import { Vec } from "../vec";
import { Bug } from "./pieceTypes";
import { Game } from "../state/game";
import { Piece } from "../state/piece";

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
			if (this.allThroughMe(board, piece)) {
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
			return true;
		}

		return false;
	}

	static moveValid(move: Move, valids: Vec[]): boolean {
		if (move.bug !== Bug.L) { return true; }

		for (const valid of valids) {
			if (valid.equals(move.dest)) {
				return true;
			}
		}
		return false;
	}

	static getValidMoves(board: Board): Vec[] {
        const moves: Vec[] = [];
		board.forEachPiece(piece => {
			moves.push(...(this as any)[piece.bug](board, piece));
		});
		moves.push(...this.placeable(board));
		return moves;
    }

	/**
	 * Returns true if the one-hive condition prevents this piece from moving
	 * In other words, true if removing this node would create two disjoint graphs
	 */
	static allThroughMe(board: Board, piece: Piece) {
		return false;
	}

	/**
	 * Returns the set of positions where a piece could be validly placed
	 * Valid placement means touching a tile of your color
	 * but no tiles of the opponents' colors
	 */
	static placeable(board: Board): Vec[] {
		const moves: Vec[] = [];

		return moves;
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
			const back = Vec.add(piece.axial, Piece.ORDER[(i + 5) % 6]);
			const forth = Vec.add(piece.axial, Piece.ORDER[(i + 1) % 6]);
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
		const moves: Vec[] = [];
		piece.forSurrounding(pos => {
			const p1 = board.get(pos);
			if (!p1) { return; }
			p1.forSurrounding(pos2 => {
				const p2 = board.get(pos2);
				if (!p2 || p2 === piece) { return; }
				p2.forSurrounding(pos3 => {
					if (!board.get(pos3)) {
						moves.push(pos3);
					}
				})
			});
		})	
		return moves;
	}

	static spider(board: Board, piece: Piece): Vec[] {
		const moves: Vec[] = [];
		return moves;
	}

	static ant(board: Board, piece: Piece): Vec[] {
		const moves: Vec[] = [];
		return moves;
	}

	static mosquito(board: Board, piece: Piece): Vec[] {
		const moves: Vec[] = [];
		const checked: {[key: string]: boolean} = {};

		// Mark mosquito as already checked so we don't get into an infinte loop
		checked[Bug.M] = true;
		
		// For each piece we're touching, acquire that piece's moves
		piece.forSurrounding(pos => {
			const check = board.get(pos);
			if (check && !checked[check.bug]) {
				checked[check.bug] = true;
				const newMoves: Vec[] = (this as any)[check.bug](board, piece);
				moves.push(...newMoves);
			}
		});

		// TODO: prune duplicates for when we explore all paths

		return moves;
	}

	static beetle(board: Board, piece: Piece): Vec[] {
		const moves: Vec[] = [];
		piece.forSurrounding((pos, i) => {
			if (piece.level > 0 || board.get(pos)) {
				moves.push(pos);
				return;
			}
			
			const back = Vec.add(piece.axial, Piece.ORDER[(i + 5) % 6]);
			const forth = Vec.add(piece.axial, Piece.ORDER[(i + 1) % 6]);
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