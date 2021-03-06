import { Env } from "../state/env";
import { Piece } from "../state/piece";
import { Var } from "../state/var";
import { Draw } from "./draw";
import { Input } from "./input";
import { Polygon } from "./polygons";
import { Util } from "../util";

export class Graphics {

	private g!: CanvasRenderingContext2D;
	private canvas!: HTMLCanvasElement;

	private lastTime = 0;
	private boundTick = this.tick.bind(this);

	constructor() {
		window.addEventListener("resize", this.resize.bind(this));
		document.addEventListener('contextmenu', e => e.preventDefault());

		this.setCanvas();
		this.slideCenter();
		this.tick();
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
		Env.slide.set(this.canvas.width / 2, this.canvas.height / 2);//.sub(Vec.div(this.size, 2).mult(Env.scale));
	}

	private draw(dt: number) {
		this.clear();

		let g = this.g;

		// let tmpScale = Env.scale / this.lastScale;
		g.save();
		g.translate(Env.slide.x, Env.slide.y);
		g.scale(Env.scale, Env.scale);

		Env.board.forEachBottom(tile => {
			if (tile !== Env.movingTile) {
				this.drawTile(g, tile);
			}
		});

		this.drawValidMoves(g);

		// Draw any piece that you're dragging on top of all the other pieces
		if (Env.movingTile) {
			g.translate(Input.moveDelta.x, Input.moveDelta.y);
			this.drawTile(g, Env.movingTile);
		}

		g.restore();
	}

	private drawValidMoves(g: CanvasRenderingContext2D) {
		if (!Env.pieceMoves) { return; }
		Env.pieceMoves.forEach(pos => {
			g.save();
			g.translate(pos.x, pos.y);

			g.strokeStyle = "#0094FF";
			g.fillStyle = "#0094FF";
			let circle = 0.04;
	
			g.lineWidth = Var.BOLD_TILE_STROKE;
	
			g.beginPath();
			Polygon.forEachEdge(6, false, (vert, prev, idx) => {
				if (idx === 0) { g.moveTo(prev.x, prev.y); }
	
				if (idx > 0) { g.stroke(); }
	
				g.beginPath();
				g.ellipse(prev.x, prev.y, circle, circle, 0, 0, Util.PI2);
				g.fill();
				
				g.beginPath();
				g.moveTo(prev.x, prev.y);
				
				g.lineTo(vert.x, vert.y);
			});
	
			g.stroke();
			g.restore();
		});
	}

	private drawTile(g: CanvasRenderingContext2D, piece: Piece) {
		g.save();
		g.translate(piece.cart.x, piece.cart.y);
		g.lineWidth = Var.PIECE_STROKE;
		const canHover = piece.drag || piece.axial.equals(Env.hex) && !Env.movingTile;
		do {
			const hover = canHover && !piece.parent && (!Env.validate || piece.player === Env.board.currentPlayer);

			g.save();
			Draw.piece(piece, g, hover, piece.parent === undefined);
			g.restore();

			g.translate(Var.STACK_OFF.x, Var.STACK_OFF.y);
			piece = piece.parent as Piece;
		} while (piece && piece !== Env.movingTile)

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