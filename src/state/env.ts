import { Vec } from "../vec";
import { Util } from "../util";
import { Piece } from "./piece";
import { Var } from "./var";
import { Board } from "./board";
import { Moves } from "../mechanics/moves";

export class Env {

	public static validate = true;

	public static turnRotation = 0;
	public static gameStarted = false;

	public static movingTile?: Piece;
	public static pieceMoves?: Vec[];
	
	public static hex = new Vec();
	public static world = new Vec();
	public static mouse = new Vec();
	public static dragStart = new Vec();
	
	public static scale = 30;
	
	private static scaleTarget = Env.scale;
	private static lastScaleTarget = Env.scale;
	private static scalePerSecond = 0;

	public static slide = new Vec();
	private static slideTarget = new Vec();

	public static player: number;
	public static opponent: string;
	public static board: Board;

	static makeMove: typeof Moves.make;

	static myTurn() {
		return this.board.myTurn(this.player);
	}

	static zoom(out: boolean) {
		this.scaleTarget *= (out ? 1 / Var.SCALE_SPEED : Var.SCALE_SPEED);
		this.scaleTarget = Math.min(Var.MAX_SCALE, this.scaleTarget);
		this.scaleTarget = Math.max(Var.MIN_SCALE, this.scaleTarget);
	}

	private static zoomStop = true;
	static smoothScale(dt: number) {
		if (this.scale === this.scaleTarget) {
			if (!this.zoomStop) {
				this.zoomStop = true;
			}
			return;
		}

		this.zoomStop = false;

		if (this.scaleTarget != this.lastScaleTarget) {
			this.scalePerSecond = (this.scaleTarget - this.scale) / .2;
			this.lastScaleTarget = this.scaleTarget;
			this.slideTarget.set(this.mouse);
		}

		let old = this.scale;
		this.scale += this.scalePerSecond * dt;
		if (this.scalePerSecond > 0 && this.scale > this.scaleTarget || this.scalePerSecond < 0 && this.scale < this.scaleTarget) {
			this.scale = this.scaleTarget;
		}		

		let change = this.scale - old;
		this.slide.sub(Vec.sub(this.slideTarget, this.slide).mult(change).div(old));
	}

	private static screenToWorld(screen: Vec): Vec {
		return Vec.sub(screen, this.slide).div(this.scale)
	}

	static calcHex() {
		this.world = this.screenToWorld(this.mouse);
		this.hex = Util.cartesianToAxial(this.world);
	}

}

(window as any).env = Env;