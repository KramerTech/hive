import { HexGrid } from "./hexgrid";
import { PiecePool, Pieces, BEE, TIE, Piece, WHITE, BLACK, TypeToText } from "./piece";

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
            let p = this.grid.getValue(move.start).popPiece();
            this.pieces.removePiece(this.pieces.getPieceIdx(p.pos, p.level));
        } else {
            if (this.whosTurn() === BLACK) {
                this.blackPiecePool.use(move.type);
            } else {
                this.whitePiecePool.use(move.type);
            }
        }
        let slot = this.grid.getValue(move.end);
        let newPiece = new Piece(move.type, move.end, slot.getLevel(), this.whosTurn());
        this.pieces.addPiece(newPiece)
        slot.pushPiece(newPiece);
        this.moveNumber++;
    }

    whosTurn() {
        return this.moveNumber % 2 === 0 ? WHITE : BLACK;
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

    toString() {
        let str = [];
        for (let i = 0; i < this.grid.height; i++) {
            for (let j = 0; j < this.grid.height - i; j++) {
                str.push(' ');
            }
            for (let j = 0; j < this.grid.width; j++) {
                let topPiece = this.grid.getValue([j,i]).getTop();
                if (topPiece) {
                    str.push(topPiece.color[0] + TypeToText[topPiece.type]);
                } else {
                    str.push('. ');
                }
            }
            str.push('\n');
        }
        return str.join('');
    }
}

export class Move {
    constructor(start, end, type) {
        this.start = start;
        this.end = end;
        this.type = type;
    }
}