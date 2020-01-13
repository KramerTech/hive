import { Env } from "../state/env";
import { Game } from "../state/game";
import { Tile } from "../state/tile";
import { Util } from "../util";
import { Vec } from "../vec";

export class Input {

	public static moveDelta = new Vec();

	// Set to true when the mouse moves, false when mouse down
	// So, if still false on mouse up, we clicked without dragging around
	// Used to avoid selecting territories when dragging around
	private dragFlag = false;

	private mouseDown = false;
	private rightOn = false;

	constructor(
		public game: Game,
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
		// let tile = this.game.board.get(Env.hex);
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
		const game = this.game;

		if (Env.turnEnded) { return; }

		let tile = this.game.board.get(Env.hex);

		this.rightOn = false;
		Input.moveDelta.zero();

		// We're dragging around a piece
		if (Env.movingTile) {
			// But in any case, stop dragging
			return this.reset();
		}

		// Right clicking the void creates a temporary piece to be placed down
		if (!tile) {
			Tile.NEW_PIECE.axial = Env.hex.clone();
			Tile.NEW_PIECE.cart = Util.axialToCartesian(Env.hex);
			this.dragTile(Tile.NEW_PIECE, true);
			return;
		}
		
		let mine = tile && tile.player === game.currentPlayer;

		// If all else has failed, buy a piece at the selected location
		console.log("Buy Piece");
		// Move.make(game, undefined, tile);
	}

	public reset() {
		if (Env.movingTile) { Env.movingTile.drag = false; }
		delete Env.movingTile;
		this.rightOn = false;
		this.mouseDown = false;
		Input.moveDelta.zero();
	}

	private dragTile(tile: Tile, right?: boolean) {
		Env.movingTile = tile;
		tile.drag = true;
		if (right) { this.rightOn = true; }
	}
	
	pickup(): boolean {
		if (Env.turnEnded) { return false; }

		let game = this.game;
		let tile = game.board.get(Env.hex);

		if (Env.movingTile) {
			return true;
		}

		if (!tile) { return false; }

		this.dragTile(tile as Tile);
		return true;
	}

	private release() { try {
		if (!Env.movingTile) {
			this.reset();
			return;
		}
		
		let game = this.game;
		let dest = game.board.get(Env.hex);
		
		// Do a buy move if we created a new piece out in the void
		if (Env.movingTile === Tile.NEW_PIECE) {
			// (deleting the origin turns it into a buy)
			Env.movingTile.drag = false;
			delete Env.movingTile;
		}

		if (dest && dest !== Env.movingTile) {
			// Move.make(game, Env.movingTile, dest, comp);
		}
	} finally {
		this.reset();
	} }

}