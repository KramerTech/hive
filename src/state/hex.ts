import { Slot } from "./slot";

export class HexGrid {

	public grid: Slot[];

	constructor(
		public width: number,
		public height: number,	
	) {
        this.grid = new Array(this.width*this.height).fill(1).map(() => new Slot());
    }

	private idx(axial: Vec): number {
		return axial.x + axial.y * this.width;
	}

    get(axial: Vec): Tile | undefined {
        return this.grid[x + y*this.width];
    }

    set([x, y], value) {
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
        const grid = new HexGrid(this.width, this.height);
        that.grid = this.grid.map(x => x.clone());
        return that;
    }


}