import { Slot } from "./slot";

// 3 ant, 3 grasshopper
// 2 beetle, 2 spidey
// 1 bee, ladybug, mosquito

export class HexGrid {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.grid = new Array(this.width*this.height).fill(1).map(() => new Slot());
    }

    getValue([x, y]) {
        return this.grid[x + y*this.width];
    }

    setValue([x, y], value) {
        this.grid[x + y*this.width] = value;
    }

    getUpLeft([x, y]) {
        return [x-1, y-1];
    }

    getUpRight([x, y]) {
        return [x, y-1];
    }

    getLeft([x, y]) {
        return [x-1, y];
    }

    getRight([x, y]) {
        return [x+1, y];
    }

    getDownLeft([x, y]) {
        return [x, y+1];
    }

    getDownRight([x, y]) {
        return [x+1, y+1];
    }

    getNeighborIdx([x, y]) {
        let ret = [];
        if (x > 0) {
            ret.push([x-1,y]);
            if (y > 0) {
                ret.push([x-1,y-1]);
            }
        }
        if (y > 0) {
            ret.push([x,y-1]);
        }
        if (x < this.width-1) {
            ret.push([x+1,y]);
            if (y < this.height-1) {
                ret.push([x+1,y+1])
            }
        }
        if (y < this.height-1) {
            ret.push([x,y+1]);
        }
    }

    clone() {
        let that = new HexGrid(this.width, this.height);
        that.grid = this.grid.map(x => x.clone());
        return that;
    }
}