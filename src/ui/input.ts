import { Move, Moves } from "../mechanics/moves";
import { Board } from "../state/board";
import { Env } from "../state/env";
import { Piece } from "../state/piece";
import { Vec } from "../vec";
import { Util } from "../util";
import { Bugs } from "../mechanics/pieceTypes";

export class Input {

	public static moveDelta = new Vec();

	// Used to avoid selecting territories when dragging around
	private dragFlag = false;

	private mouseDown = false;

	private pickCycle = 0;

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
	}

	private wheel(event: MouseWheelEvent) {
		Env.zoom(event.deltaY > 0);
	}
		
	private move(event: MouseEvent) {
		Env.mouse.set(event.clientX, event.clientY);
		Env.calcHex();
		if (Env.movingTile) {
			Input.moveDelta.set(Env.world).sub(Env.movingTile.cart).sub(Env.dragStart);
		} else if (this.mouseDown) {
			Env.slide.add(event.movementX, event.movementY);
		}
		this.dragFlag = true;
	}

	private rightClick() {
		if (this.mouseDown) { return; }
		if (Env.movingTile) {
			this.pickCycle++;
			this.pickCycle %= Bugs.length;
		}
		const bugs = this.board.currentPool().bugs(this.board.turn);
		if (!bugs.length) {
			console.log("All of out pieces");
			return;
		}

		const piece = this.board.currentPool().get(bugs[this.pickCycle % bugs.length]);
		// console.log("Place", piece.bug, this.pickCycle);
		
		this.dragPiece(piece, true);
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
			Env.pieceMoves = Moves.placeable(this.board).map(move => Util.axialToCartesian(move));
			if (Env.movingTile) {
				Env.movingTile.drag = false;
			} else {
				Env.dragStart.zero();
				Input.moveDelta.set(Env.world).sub(piece.cart)
			}
		} else {
			if (!piece.artPoint) {
				Env.pieceMoves = Moves.getPieceMoves(this.board, piece).map(move => Util.axialToCartesian(move));
			}
			Env.dragStart.set(Env.world).sub(piece.cart);
		}
		Env.movingTile = piece;
		piece.drag = true;
	}
	
	private pickup(): boolean {
		let piece = this.board.getSlot(Env.hex).getTop();

		if (Env.movingTile) { return true; }
		if (!piece || piece.player !== this.board.currentPlayer) { return false; }

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
		Moves.make(this.board, move, true);
	} finally {
		this.reset();
	}}

}