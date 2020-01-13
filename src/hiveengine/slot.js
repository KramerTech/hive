export class Slot {
    constructor() {
        this.stack = [];
    }

    hasPiece() {
        return this.stack.length > 0;
    }

    getTop() {
        return this.stack[this.stack.length - 1];
    }

    getBottom() {
        return this.stack[0];
    }

    pushPiece(piece) {
        this.stack.push(piece);
    }

    popPiece() {
        return this.stack.pop();
    }

    getLevel() {
        return this.stack.length;
    }

    clone() {
        let that = new Slot();
        that.stack = this.stack.slice(0);
        return that;
    }
}