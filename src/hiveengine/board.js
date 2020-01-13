import { HexGrid } from "./hexgrid";
import { PiecePool, Pieces, BEE, TIE, Piece, WHITE, BLACK } from "./piece";

export class Board {
    constructor(w, h) {
        this.grid = new HexGrid(w, h);
        this.whitePiecePool = new PiecePool();
        this.blackPiecePool = new PiecePool();
        this.pieces = new Pieces();
        this.moveNumber = 0;
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

    clone() {
        let that = new Board(this.grid.width, this.grid.height);
        that.grid = this.grid.clone();
        that.pieces = this.pieces.map(x => x.clone());
        that.blackPiecePool = this.blackPiecePool.clone();
        that.whitePiecePool = this.whitePiecePool.clone();
        that.moveNumber = this.moveNumber;
    }
}

export class Move {
    constructor(start, end, type) {
        this.start = start;
        this.end = end;
        this.type = type;
    }
}