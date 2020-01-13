import { Util } from "../util";
import { Vec } from "../vec";
import { Tile } from "./tile";
import { Rand } from "../random";

export class Board {

	private grid: Tile[][] = [];
	private flat: Tile[] = [];

	constructor(
		public players: number,
		rand?: Rand,
		grid?: Board,
	) {
		if (grid) {
			for (let tile of grid.flat) {
				this.set(tile.axial, tile.clone());
			}
			return;
		} else if (!rand) {
			return;
		}

		let pos = new Vec();
		let min = new Vec(1000, 1000);
		
		let size = rand.next(20, 40);
		size *= players;

		let lastDir = 0;
		for (let i = 0; i < size; i++) {
			// Don't go the same direction more than once
			let dirNum = rand.next(5)
			if (dirNum >= lastDir) dirNum++;
			lastDir = dirNum;

			// Get the axial vec of the chosen direction
			let dir = Tile.ORDER[dirNum];

			// Keep going in that direction until there's an empty space
			do { pos.add(dir); }
			while (this.get(pos));

			// Fill that empty space
			let tile = new Tile(pos.clone(), i % players);
			this.set(pos, tile);
			min.min(tile.cart);
		}

		this.zeroSortAndSet(min);
	}

	// private rotate(tile: Tile) {
	// 	for (let r = 1; r < 6; r++) {
	// 		let newAxial = Util.cartesianToAxial(Vec.rotate(tile.cart, Util.degToRad(r * 60)));
	// 		let player = (tile.player + 1) % this.players;
	// 		this.set(newAxial, new Tile(newAxial, player, r));
	// 	}
	// }

	public forEachTile(cb: (tile: Tile, i: number) => void) {
		this.flat.forEach(cb);
	}

	private zeroSortAndSet(min: Vec) {
		let array = this.flat;
		this.grid = [];
		this.flat = [];

		min = Vec.sub(min, new Vec(1, 1));		
		let hexOff = Util.cartesianToAxial(min);
		let cartOff = Util.axialToCartesian(hexOff);

		array.forEach(tile => {
			tile.axial.sub(hexOff);
			tile.cart.sub(cartOff);
			this.set(tile.axial, tile);
		});

		this.flat.sort((a, b) => {
			return b.cart.x - a.cart.x || b.cart.y - a.cart.y;
		});
	}


	size(): Vec {
		let max = this.flat[0].cart.clone();
		for (let tile of this.flat) {
			let c = tile.cart;
			max.max(c);
		}
		return max.add(Util.axialToCartesian(new Vec(1, 1)));
	}

	get(axial: Vec | undefined): Tile | undefined {
		if (!axial) { return undefined; }
		if (!this.grid[axial.x]) { return; }
		return this.grid[axial.x][axial.y];
	}

	set(axial: Vec, tile: Tile | undefined) {
		if (tile) {
			if (!this.grid[axial.x]) { this.grid[axial.x] = []; }
			let existing = this.grid[axial.x][axial.y];
			if (existing) {
				this.flat[this.flat.indexOf(existing)] = tile;;
			} else {
				this.flat.push(tile);
			}
			this.grid[axial.x][axial.y] = tile;
		} else if (this.grid[axial.x]) {
			let tile = this.grid[axial.x][axial.y];
			if (tile) { this.flat.splice(this.flat.indexOf(tile)); }
			this.grid[axial.x][axial.y];
			if (!this.grid[axial.x].length) {
				delete this.grid[axial.x];
			}
		}
	}

	clone(offset?: number): Board {
		let clone = new Board(this.players, undefined, this);
		if (offset) {
			clone.flat.forEach(t => {
				t.player += offset;
				t.player %= this.players;
			});
		}
		return clone;
	}

}