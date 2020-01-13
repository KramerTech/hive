export const SPIDER = 'spider';
export const BEE = 'bee';
export const BEETLE = 'beetle';
export const GRASSHOPPER = 'grasshopper';
export const ANT = 'ant';
export const LADYBUG = 'ladybug';
export const MOSQUITO = 'mosquito';
export const BLACK = 'black';
export const WHITE = 'white';
export const TIE = 'tie';
export const TYPES = [ANT,GRASSHOPPER,SPIDER,BEETLE,BEE,LADYBUG,MOSQUITO];

export class Pieces {
    constructor() {
        this.pieces = [];
    }

    getByIdx(idx) {
        return this.pieces[idx];
    }

    getPieceIdx([x, y], level) {
        for (let i = 0; i < this.pieces.length; i++) {
            let p = this.pieces[i];
            if (p.pos.x === x && p.pos.y === y && p.level === level) {
                return i;
            }
        }
    }

    getPiecesByType(type, color) {
        let idxs = [];
        for (let i = 0; i < this.pieces.length; i++) {
            let p = this.pieces[i];
            if (p.type === type && p.color === color) {
                idxs.push(i);
            }
        }
        return idxs;
    }

    removePiece(idx) {
        return this.pieces.splice(idx, 1);
    }

    addPiece(piece) {
        this.pieces.push(piece);
    }
}

export class Piece {
    constructor(type, pos, level, color) {
        this.type = type;
        this.pos = pos;
        this.level = level;
        this.color = color;
    }

    clone() {
        return new Piece(this.type, this.pos, this.level, this.color);
    }
}

export class PiecePool {
    constructor() {
        this.pool = new Map();
        this.pool.set(ANT, 3);
        this.pool.set(GRASSHOPPER, 3);
        this.pool.set(SPIDER, 2);
        this.pool.set(BEETLE, 2);
        this.pool.set(BEE, 1);
        this.pool.set(LADYBUG, 1);
        this.pool.set(MOSQUITO, 1);
    }

    canUse(piece) {
        return this.pool.get(piece) > 0;
    }

    use(piece) {
        this.pool.set(piece, this.pool.get(piece) - 1);
    }

    clone() {
        let that = new PiecePool();
        that.pool = new Map(this.pool);
        return that;
    }
}