import { Bugs } from "../mechanics/pieceTypes";
import { Rand } from "../random";
import { Vec } from "../vec";
import { Piece } from "./piece";
import { PiecePool } from "./pool";
import { Slot } from "./slot";
import { Move } from "../mechanics/moves";

export class Board {

	public turn = 0;
	public currentPlayer = 0;

	private size: number;

	private pieces: Piece[] = [];
	private pools: PiecePool[] = [];
	private map = new Map<number, Piece>();
	private bees: {[player: number]: Piece} = {};

	private time = 0;

	constructor(
		public players: number,
		clone?: boolean,
	) {
		this.size = this.players * PiecePool.TOTAL;

		if (clone) { return; }
		(window as any)["board"] = this;
		this.reset();
	}

	public reset() {
		this.turn = 0;
		this.currentPlayer = 0;
		
		this.bees = {};
		this.pools = [];
		this.pieces = [];
		this.map = new Map<number, Piece>();

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

	public forEachTop(cb: (tile: Piece, i: number) => void) {
		this.pieces.forEach((p, i) => { if (!p.parent) cb(p, i) });
	}

	public forEachBottom(cb: (tile: Piece, i: number) => void) {
		this.pieces.forEach((p, i) => { if (p.level === 0) cb(p, i) });
	}

	private findArticulationPoints() {
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
	private articulationDFS(piece: Piece, parent?: Piece) {
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

    public getPiecesByType(bug: Bugs, player: number) {
        let pieces = [];
        for (const piece of this.pieces) {
			if (piece.bug === bug && piece.player === player) {
				pieces.push(piece);
			}
		}
        return pieces;
    }

    public placePiece(piece: Piece, dest: Vec) {
		this.pieces.push(piece);
		piece.update(dest);
		this.put(piece);
		if (piece.bug === Bugs.QUEEN) {
			this.bees[piece.player] = piece;
		}
	}

	public applyMove(move: Move) {
		let piece: Piece;
		if (move.src) {
			this.move(move.src, move.dest);
		} else {
			piece = this.currentPool().use(move.bug);
			this.placePiece(piece, move.dest);
		}

		//TODO: check if we moved next to a queen, and if so, is that queen surrounded?

		this.nextTurn();
		this.findArticulationPoints();
	}

	public beeDown(player = this.currentPlayer) {
		return this.bees[player];
	}

	get(axial: Vec): Piece | undefined {
		let piece = this.map.get(axial.x + axial.y * this.size);
		if (piece) {
			while (piece.parent) {
				piece = piece.parent;
			}
		}
		return piece;
	}

	private move(src: Vec, dest: Vec) {
		let piece = this.map.get(src.index(this.size)) as Piece;
		if (piece.parent) {
			// Get second to last in stack
			while (piece.parent && piece.parent.parent) {
				piece = piece.parent;
			}

			// Remove pointer and then work with top
			let tmp = piece.parent as Piece;
			delete piece.parent;
			piece = tmp;
		} else {
			this.map.delete(src.index(this.size));
		}

		piece.update(dest);
		this.put(piece);
	}

	put(piece: Piece) {
		const existing = this.get(piece.axial);
		if (existing) {
			existing.parent = piece;
			piece.level = existing.level + 1;
		} else {
			piece.level = 0;
			const axial = piece.axial;
			this.map.set(axial.x + axial.y * this.size, piece);
		}
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
        const board = new Board(this.players, true);

		board.turn = this.turn;
		board.currentPlayer = this.currentPlayer;

		// Clone all bottom pieces and anything stacked on top
		// maintaining the relationships
		this.forEachBottom(piece => {
			let clone = piece.clone();
			board.pieces.push(clone);

			if (piece.bug === Bugs.QUEEN) {
				board.bees[piece.player] = clone;
			}

			while (piece.parent) {
				piece = piece.parent;
				clone.parent = piece.clone();
				clone = clone.parent;
				board.pieces.push(clone);
			}

			const axial = clone.axial;
			board.map.set(axial.x + axial.y * this.size, clone);
		});

		for (const pool of this.pools) {
			board.pools.push(pool.clone());
		}

		return board;
	}

}