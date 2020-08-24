import { Move, Moves } from "../mechanics/moves";
import { Env } from "../state/env";
import { Piece } from "../state/piece";
import { Vec } from "../vec";
import { Util } from "../util";
import { PieceMoves } from "../mechanics/pieceMoves";

export class Input {

	public static moveDelta = new Vec();

	// Used to avoid selecting territories when dragging around
	private dragFlag = false;

	private mouseDown = false;

	private pickCycle = 0;

	constructor() {
		window.addEventListener("mousedown", this.down.bind(this));
		window.addEventListener("mouseup", this.up.bind(this));
		window.addEventListener("wheel", this.wheel.bind(this));

		// TODO: pinch zoom on mobile
		window.addEventListener("mousemove", this.move.bind(this));
	}

	private down(event: MouseEvent) {
		if (event.button === 0) {
			this.dragFlag = false;
			if (!this.pickup()) {
				this.mouseDown = true;
			}
		}
	}

	private up(event: MouseEvent) {
		// let tile = Env.board.get(Env.hex);
		if (event.button === 0) {
			if (!this.dragFlag) {
				this.dragFlag = true;
				Input.moveDelta.zero();
			}
			this.release();
		} else if (event.button === 2) {
			this.rightClick();
		}
	}

	private wheel(event: MouseWheelEvent) {
		if (Env.board.turn === 0) { return; }
		Env.zoom(event.deltaY > 0);
	}
		
	private move(event: MouseEvent) {
		Env.mouse.set(event.clientX, event.clientY);
		Env.calcHex();
		if (Env.movingTile) {
			Input.moveDelta.set(Env.world).sub(Env.movingTile.cart).sub(Env.dragStart);
		} else if (this.mouseDown) {
			if (Env.board.turn === 0) { return; }
			Env.slide.add(event.movementX, event.movementY);
		}
		this.dragFlag = true;
	}

	private rightClick() {
		if (this.mouseDown || !Env.myTurn() || !Env.gameStarted) { return; }

		const pool = Env.board.currentPool();
		const bugs = pool.bugs(Env.board.turn);
		
		if (!bugs.length) {
			console.log("All of out pieces");
			return;
		}

		// Right click cycles through available bugs
		if (Env.movingTile) {
			this.pickCycle++;
		}
		this.pickCycle %= bugs.length;

		this.dragPiece(pool.get(bugs[this.pickCycle]), true);
	}

	public reset() {
		if (Env.movingTile) { Env.movingTile.drag = false; }
		delete Env.movingTile;
		delete Env.pieceMoves;
		this.mouseDown = false;
		Input.moveDelta.zero();
	}

	private dragPiece(piece: Piece, place?: boolean) {
		if (place) {
			Env.pieceMoves = Moves.getPlaceable(Env.board).map(move => Util.axialToCartesian(move));
			if (Env.movingTile) {
				Env.movingTile.drag = false;
			} else {
				Env.dragStart.zero();
				Input.moveDelta.set(Env.world).sub(piece.cart)
			}
		} else {
			Env.pieceMoves = PieceMoves.get(Env.board, piece).map(move => Util.axialToCartesian(move));
			Env.dragStart.set(Env.world).sub(piece.cart);
		}
		Env.movingTile = piece;
		piece.drag = true;
	}
	
	private pickup(): boolean {
		if (!Env.myTurn()) { return false; }
		
		let piece = Env.board.get(Env.hex);

		if (Env.movingTile) { return true; }
		if (!piece || (Env.validate && piece.player !== Env.board.currentPlayer)) { return false; }

		this.dragPiece(piece as Piece);
		return true;
	}

	private release() { try {
		if (!Env.movingTile) { return; }
		const src = Env.movingTile.level < 0 ? undefined : Env.movingTile.axial;
		const move = new Move(
			Env.movingTile.player,
			Env.movingTile.bug,
			Env.hex,
			src,
		);
		if (Env.validate) {
			Env.makeMove(Env.board, move);
		} else {
			Env.board.applyMove(move);
		}
	} finally {
		this.reset();
	}}

}