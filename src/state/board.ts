import { Bugs } from "../mechanics/pieceTypes";
import { Rand } from "../random";
import { Vec } from "../vec";
import { Piece } from "./piece";
import { PiecePool } from "./pool";
import { Slot } from "./slot";
import { Move } from "../mechanics/moves";

export class Board {

	public offset: number;

	public turn = 0;
	public currentPlayer = 0;

	private grid: Slot[] = [];
	private pieces: Piece[] = [];
	
	public pools: PiecePool[] = [];
	public bees: {[player: number]: Piece} = {};

	private time = 0;

	constructor(
		public players: number,
		public width: number,
		public height: number,
		clone?: boolean,
	) {
		this.offset = Math.floor(this.height / 2) * this.width + Math.floor(this.width / 2);
		if (clone) { return; }
		(window as any)["board"] = this;
		this.reset();
	}

	// private rotate(tile: Tile) {
	// 	for (let r = 1; r < 6; r++) {
	// 		let newAxial = Util.cartesianToAxial(Vec.rotate(tile.cart, Util.degToRad(r * 60)));
	// 		let player = (tile.player + 1) % this.players;
	// 		this.set(newAxial, new Tile(newAxial, player, r));
	// 	}
	// }
	
	public reset() {
		this.turn = 0;
		this.currentPlayer = 0;
		
		this.bees = {};
		this.pools = [];
		this.pieces = [];
		this.grid = new Array(this.width * this.height).fill(1).map(() => new Slot());

		for (let i = 0; i < this.players; i++) {
			this.pools.push(new PiecePool(i));
		}
	}


	public randomize(
		rounds = 1 + Math.floor(Math.random() * PiecePool.TOTAL),
		seed = Math.floor(Math.random() * 1e6)
	) {
		const rand = new Rand(seed);
		console.log("Randomizing", rounds, "rounds with seed", seed);

		this.reset();

		let pos = new Vec();
		let size = Math.min(rounds, PiecePool.TOTAL) * this.players;

		let lastDir = 0;
		for (let i = 0; i < size; i++) {
			// Don't go the same direction more than once
			let dirNum = rand.next(5)
			if (dirNum >= lastDir) dirNum++;
			lastDir = dirNum;

			// Get the axial vec of the chosen direction
			let dir = Slot.ORDER[dirNum];

			// Keep going in that direction until there's an empty space
			do { pos.add(dir); }
			while (this.get(pos));

			// Fill that empty space with a pseudo-rand available bug
			const pool = this.currentPool()
			const bugs = pool.bugs(this.turn);
			const bug = bugs[rand.next(bugs.length)];
			this.placePiece(pool.use(bug), pos.clone());
			this.nextTurn();
		}

		this.findArticulationPoints();
	}

	public forEachPiece(cb: (tile: Piece, i: number) => void) {
		this.pieces.forEach(cb);
	}

	findArticulationPoints() {
		if (!this.pieces.length) { return; }
		this.pieces.forEach(p => {
			p.artPoint = false;
			p.visited = false;
			p.tin = -1;
			p.low = -1;
		});

		this.time = 0;
		// We need to make sure we get the top piece as the root
		const root = this.get(this.pieces[0].axial) as Piece;
		this.articulationDFS(root);
	}

	// Based on https://en.wikipedia.org/wiki/Biconnected_component
	articulationDFS(piece: Piece, parent?: Piece) {
		piece.visited = true;
		piece.tin = this.time++;
		piece.low = piece.tin;

		let children = 0;

		piece.forSurrounding(pos => {
			const check = this.get(pos);
			if (!check || check === parent) { return; }
			if (check.visited) {
				piece.low = Math.min(piece.low, check.tin);
			} else {
				this.articulationDFS(check, piece);
				piece.low = Math.min(piece.low, check.low);
				if (check.low >= piece.tin && parent) {
					piece.artPoint = true;
				}
				children++;
			}
		});

		if (!parent && children > 1) {
			piece.artPoint = true;
		}
	}

    getPiecesByType(bug: Bugs, player: number) {
        let pieces = [];
        for (const piece of this.pieces) {
			if (piece.bug === bug && piece.player === player) {
				pieces.push(piece);
			}
		}
        return pieces;
    }

    placePiece(piece: Piece, dest: Vec) {
		this.pieces.push(piece);
		piece.update(dest);
		this.getSlot(dest).pushPiece(piece);
		if (piece.bug === Bugs.QUEEN) {
			this.bees[piece.player] = piece;
		}
	}

	move(move: Move) {
		let piece: Piece;
		if (move.src) {
			piece = this.getSlot(move.src).popPiece() as Piece;
			this.getSlot(move.dest).pushPiece(piece);
			piece.update(move.dest);
		} else {
			piece = this.currentPool().use(move.bug);
			this.placePiece(piece, move.dest);
		}

		//TODO: check if we moved next to a queen, and if so, is that queen surrounded?

		this.nextTurn();
		this.findArticulationPoints();
	}

	get(axial: Vec): Piece | undefined {
		const slot = this.getSlot(axial);
		if (slot) { return slot.getTop(); }
	}

	getSlot(axial: Vec): Slot {
		const idx = this.offset + axial.x + axial.y * this.width;
		if (idx < 0 || idx > this.grid.length) {
			//TODO: enlarge grid?
			console.log("BAD SLOT", axial);
			return new Slot();
		}
		return this.grid[idx];
	}

	nextTurn() {
		this.turn++;
		this.currentPlayer++;
		this.currentPlayer %= this.players;
	}
	
	currentPool(): PiecePool {
		return this.pools[this.currentPlayer];
	}

    clone(): Board {
        const board = new Board(
			this.players,
			this.width,
			this.height,
			true,
		);

		board.turn = this.turn;
		board.currentPlayer = this.currentPlayer;

		for (const slot of this.grid) {
			const clone = slot.clone();
			board.grid.push(clone);
			for (const piece of clone.stack) {
				board.pieces.push(piece);
				if (piece.bug === Bugs.QUEEN) {
					board.bees[piece.player] = piece;
				}
			}
		}

		for (const pool of this.pools) {
			board.pools.push(pool.clone());
		}

		return board;
	}
	
	toString() {
        let str = [];
        for (let i = this.height - 1; i >= 0; i--) {
            for (let j = 0; j < this.height - i; j++) {
                str.push(' ');
            }
            for (let j = 0; j < this.width; j++) {
                let topPiece = this.grid[j + this.width * i].getTop();
                if (topPiece) {
                    str.push(topPiece.player + topPiece.bug[0]);
                } else {
                    str.push('. ');
                }
            }
            str.push('\n');
        }
        return str.join('');
    }

}