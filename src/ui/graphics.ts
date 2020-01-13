import { Env } from "../state/env";
import { Game } from "../state/game";
import { Piece } from "../state/piece";
import { Var } from "../state/var";
import { Vec } from "../vec";
import { Draw } from "./draw";
import { Input } from "./input";

export class Graphics {

	private size!: Vec;
	private lastScale: number = Env.scale;

	private g!: CanvasRenderingContext2D;
	private canvas!: HTMLCanvasElement;

	private lastTime = 0;
	private boundTick = this.tick.bind(this);

	constructor(
		public game: Game
	) {
		window.addEventListener("resize", this.resize.bind(this));
		document.addEventListener('contextmenu', e => e.preventDefault());

		this.gameUpdated();

		this.setCanvas();
		this.slideCenter();
		this.tick();
	}

	gameUpdated() {
		this.size = new Vec(this.game.board.width, this.game.board.height);
	}

	tick() {
		const now = Date.now();
		let dt = (now - this.lastTime) / 1000;
		this.lastTime = now;

		// let frames = Math.floor(1 / dt);
		// if (frames < 30) { console.log(frames); }

		if (dt > .05) { dt = 0.05; }

		Env.smoothScale(dt);

		this.draw(dt);

		requestAnimationFrame(this.boundTick);
	}

	setCanvas() {
		this.canvas = <HTMLCanvasElement> document.getElementById("canvas");

		const g = this.canvas.getContext("2d");
		if (g) { this.g = g; }
		else { /* TODO: Canvas unsupported error */ }

		this.resize();
		this.clear();
	}

	slideCenter() {
		Env.slide.set(this.canvas.width / 2, this.canvas.height / 2).sub(Vec.div(this.size, 2).mult(Env.scale));
	}


	private draw(dt: number) {
		this.clear();

		let g = this.g;

		// let tmpScale = Env.scale / this.lastScale;
		g.save();
		g.translate(Env.slide.x, Env.slide.y);
		g.scale(Env.scale, Env.scale);

		this.game.board.forEachPiece(tile => {
			if (tile !== Env.movingTile) {
				this.drawTile(g, tile);
			}
		});

		// Draw any piece that you're dragging on top of all the other pieces
		if (Env.movingTile) {
			g.translate(Input.moveDelta.x, Input.moveDelta.y);
			this.drawTile(g, Env.movingTile);
		}

		g.restore();
	}

	private drawTile(g: CanvasRenderingContext2D, tile: Piece) {

		g.save();
		g.translate(tile.cart.x, tile.cart.y);
		g.lineWidth = Var.PIECE_STROKE;

		let hover = tile.drag || tile.axial.equals(Env.hex) && !Env.movingTile;

		// if (active && this.game.currentPlayer === Env.myPlayer) {
		// 	if (tile.drag || (tile.axial.equals(Env.hex) && !Env.movingTile)) {
		// 		hover = true;
		// 		if (tile.drag) {
		// 			g.save();
		// 			Draw.tile(tile, g, hover, active);
		// 			g.restore();
		// 		}
		// 		g.translate(Input.moveDelta.x, Input.moveDelta.y);
		// 	}
		// }
		tile.draw(g);
		Draw.tile(tile, g, hover);
		g.restore();
	}

	private resize() {
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
	}

	private clear() {
		this.g.fillStyle = "#635145";
		this.g.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

}