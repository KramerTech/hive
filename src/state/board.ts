import { Util } from "../util";
import { Vec } from "../vec";
import { Piece } from "./piece";
import { Rand } from "../random";
import { HexGrid } from "./hex";
import { Bug } from "../mechanics/pieceTypes";

export class Board {

	public turn = 0;
	public currentPlayer = 0;

	private grid: HexGrid;
	private pieces: Piece[] = [];

	constructor(
		public players: number,
		public w: number,
		public h: number,
		public rand: Rand,
		grid?: HexGrid,
	) {
		this.grid = new HexGrid(w, h);

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
			let dir = Piece.ORDER[dirNum];

			// Keep going in that direction until there's an empty space
			do { pos.add(dir); }
			while (this.get(pos));

			// Fill that empty space
			let tile = new Piece(pos.clone(), i % players);
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

	public forEachTile(cb: (tile: Piece, i: number) => void) {
		this.pieces.forEach(cb);
	}

	private zeroSortAndSet(min: Vec) {
		let array = this.pieces;
		this.grid = [];
		this.pieces = [];

		min = Vec.sub(min, new Vec(1, 1));		
		let hexOff = Util.cartesianToAxial(min);
		let cartOff = Util.axialToCartesian(hexOff);

		array.forEach(tile => {
			tile.axial.sub(hexOff);
			tile.cart.sub(cartOff);
			this.set(tile.axial, tile);
		});

		this.pieces.sort((a, b) => {
			return b.cart.x - a.cart.x || b.cart.y - a.cart.y;
		});
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

    getPiecesByType(bug: Bug, player: number) {
        let pieces = [];
        for (const piece of this.pieces) {
			if (piece.bug === bug && piece.player === player) {
				pieces.push(piece);
			}
		}
        return pieces;
    }

    removePiece(idx) {
        return this.pieces.splice(idx, 1);
    }

    addPiece(piece: Piece) {
        this.pieces.push(piece);
	}
	


	// size(): Vec {
	// 	let max = this.pieces[0].cart.clone();
	// 	for (let tile of this.pieces) {
	// 		let c = tile.cart;
	// 		max.max(c);
	// 	}
	// 	return max.add(Util.axialToCartesian(new Vec(1, 1)));
	// }

	// get(axial: Vec | undefined): Piece | undefined {
	// 	if (!axial) { return undefined; }
	// 	if (!this.grid[axial.x]) { return; }
	// 	return this.grid[axial.x][axial.y];
	// }

	// set(axial: Vec, tile: Piece | undefined) {
	// 	if (tile) {
	// 		if (!this.grid[axial.x]) { this.grid[axial.x] = []; }
	// 		let existing = this.grid[axial.x][axial.y];
	// 		if (existing) {
	// 			this.pieces[this.pieces.indexOf(existing)] = tile;;
	// 		} else {
	// 			this.pieces.push(tile);
	// 		}
	// 		this.grid[axial.x][axial.y] = tile;
	// 		// tile.update(axial);
	// 	} else if (this.grid[axial.x]) {
	// 		let tile = this.grid[axial.x][axial.y];
	// 		if (tile) { this.pieces.splice(this.pieces.indexOf(tile)); }
	// 		this.grid[axial.x][axial.y];
	// 		if (!this.grid[axial.x].length) {
	// 			delete this.grid[axial.x];
	// 		}
	// 	}
	// }

	// clone(offset?: number): Board {
	// 	let clone = new Board(this.players, undefined, this);
	// 	if (offset) {
	// 		clone.pieces.forEach(t => {
	// 			t.player += offset;
	// 			t.player %= this.players;
	// 		});
	// 	}
	// 	return clone;
	// }

	nextTurn() {
		this.turn++;
		this.currentPlayer++;
		this.currentPlayer %= this.players;
	}

    clone() {
		const grid = this.grid.clone();
        const board = new Board(
			this.players,
			this.grid.width,
			this.grid.height,
			this.rand,
			grid,
		);
		board.pieces = this.pieces.slice(0);
        that.blackPiecePool = this.blackPiecePool.clone();
        that.whitePiecePool = this.whitePiecePool.clone();
        that.moveNumber = this.moveNumber;
    }

}