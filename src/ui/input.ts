import { Move, Moves } from "../mechanics/moves";
import { Board } from "../state/board";
import { Env } from "../state/env";
import { Piece } from "../state/piece";
import { Vec } from "../vec";
import { Util } from "../util";

export class Input {

	public static moveDelta = new Vec();

	// Set to true when the mouse moves, false when mouse down
	// So, if still false on mouse up, we clicked without dragging around
	// Used to avoid selecting territories when dragging around
	private dragFlag = false;

	private mouseDown = false;
	private rightOn = false;

	constructor(
		public board: Board,
	) {
		window.addEventListener("mousedown", this.down.bind(this));
		window.addEventListener("mouseup", this.up.bind(this));
		window.addEventListener("wheel", this.wheel.bind(this));

		// TODO: pinch zoom on mobile
		window.addEventListener("mousemove", this.move.bind(this));
	}

	private down(event: MouseEvent) {
		if (event.button === 0) {
			if (this.rightOn) {
				return this.up(event);
			}
			this.dragFlag = false;
			if (!this.pickup()) {
				this.mouseDown = true;
			}
		}
	}

	private up(event: MouseEvent) {
		// let tile = this.board.get(Env.hex);
		if (event.button === 0) {
			if (!this.dragFlag) {
				this.dragFlag = true;
				Input.moveDelta.zero();
			}
			this.release();
		} else if (event.button === 2) {
			this.rightClick();
		}
		// else if (event.button === 1) {
		// 	if (tile && tile.piece) tile.piece.nextTurn();
		// 	// 	Move.make(this.game, undefined, tile);
		// 	// }
		// }
	}

	private wheel(event: MouseWheelEvent) {
		Env.zoom(event.deltaY > 0);
	}
		
	private move(event: MouseEvent) {
		Env.mouse.set(event.clientX, event.clientY);
		Env.calcHex();
		if (Env.movingTile) {
			Input.moveDelta.set(Vec.sub(Env.world, Env.movingTile.cart));
		} else if (this.mouseDown) {
			Env.slide.add(event.movementX, event.movementY);
		}
		this.dragFlag = true;
	}

	private rightClick() {
		if (Env.turnEnded) { return; }

		let tile = this.board.getSlot(Env.hex).getTop();

		this.rightOn = false;
		Input.moveDelta.zero();

		// We're dragging around a piece
		if (Env.movingTile) {
			// But in any case, stop dragging
			return this.reset();
		}

		// Right clicking the void creates a temporary piece to be placed down
		if (!tile) {
			// TODO: pull from appropriate pool
			// Piece.NEW_PIECE.axial = Env.hex.clone();
			// Piece.NEW_PIECE.cart = Util.axialToCartesian(Env.hex);
			// this.dragTile(Piece.NEW_PIECE, true);
			return;
		}
		
		let mine = tile && tile.player === this.board.currentPlayer;

		// If all else has failed, buy a piece at the selected location
		console.log("Buy Piece");
		// Move.make(game, undefined, tile);
	}

	public reset() {
		if (Env.movingTile) { Env.movingTile.drag = false; }
		delete Env.movingTile;
		delete Env.pieceMoves;
		this.rightOn = false;
		this.mouseDown = false;
		Input.moveDelta.zero();
	}

	private dragTile(piece: Piece, right?: boolean) {
		Env.movingTile = piece;
		if (!piece.artPoint) {
			Env.pieceMoves = Moves.getPieceMoves(this.board, piece).map(move => Util.axialToCartesian(move));
		}
		piece.drag = true;
		if (right) { this.rightOn = true; }
	}
	
	pickup(): boolean {
		let piece = this.board.getSlot(Env.hex).getTop();

		if (Env.movingTile) {
			return true;
		}

		if (!piece || piece.player !== this.board.currentPlayer) { return false; }

		this.dragTile(piece as Piece);
		return true;
	}

	private release() { try {
		if (!Env.movingTile) {
			return;
		}
		
		let dest = Env.hex;
		
		// Do a buy move if we created a new piece out in the void
		// if (Env.movingTile === Tile.NEW_PIECE) {
		// 	// (deleting the origin turns it into a buy)
		// 	Env.movingTile.drag = false;
		// 	delete Env.movingTile;
		// }

		const move = new Move(
			Env.movingTile.player,
			Env.movingTile.bug,
			dest,
			Env.movingTile.axial,
		);
		Moves.make(this.board, move);
	} finally {
		this.reset();
	}}

}