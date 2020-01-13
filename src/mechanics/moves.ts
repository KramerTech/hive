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
		
	}

	getValidMoves() {
        let moves = [];

        //move for each piece on the board

        //move for each piece in the pool

    }

    executeMove(move) {
        if (move.start) {
            this.grid.getValue(move.start).popPiece();
        } else {
            this.piecePool.use(move.type);
        }
        let slot = this.grid.getValue(move.end);
        slot.pushPiece(new Piece(move.type, move.end, slot.getLevel()));
        this.moveNumber++;
    }

    checkWin() {
        let blackWin = false;
        let whiteWin = false;

        let whiteBee = this.pieces.getPiecesByType(BEE, WHITE);
        let blackBee = this.pieces.getPiecesByType(BEE, BLACK);

        if (whiteBee.length > 0) {
            let whiteBeeP = this.pieces.getByIdx[whiteBee[0]];
            let around = this.grid.getNeighborIdx(whiteBeeP.pos);
            let count = 0;
            around.forEach(pos => {
                if (this.grid.getByIdx(pos).hasPiece()) {
                    count++;
                }
            });

            blackWin = count === around.length;
        }

        if (blackBee.length > 0) {
            let blackBeeP = this.pieces.getByIdx[blackBee[0]];
            let around = this.grid.getNeighborIdx(blackBeeP.pos);
            let count = 0;
            around.forEach(pos => {
                if (this.grid.getByIdx(pos).hasPiece()) {
                    count++;
                }
            });

            whiteWin = count === around.length;
        }

        if (blackWin && whiteWin) {
            return TIE;
        }

        if (blackWin) {
            return BLACK;
        }

        if (whiteWin) {
            return WHITE;
        }

        return null;
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