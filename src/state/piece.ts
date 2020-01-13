import { Color } from "../ui/colors";
import { Polygon } from "../ui/polygons";
import { Util } from "../util";
import { Vec } from "../vec";
import { Var } from "./var";
import { Bugs } from "../mechanics/pieceTypes";

export class Piece {

	public static FAKE = new Piece(Vec.ZERO, 0);
	public static NEW_PIECE = new Piece(Vec.ZERO, 0);

	public cart!: Vec;
	public hover = false;
	public drag = false;

	constructor(
		public axial: Vec,
		public player: number,
		public bug = Bugs[Math.floor(Bugs.length * Math.random())],
	) {
		console.log(bug);
		this.update(this.axial);
	}

	update(axial: Vec) {
		this.axial = axial;
		this.cart = Util.axialToCartesian(axial);
	}


	draw(g: CanvasRenderingContext2D) {
		let color = Color.player[this.player];
		
		Polygon.draw(g, 6, false);
		g.fillStyle = color;
		g.fill();

		g.strokeStyle = "black";
		g.fillStyle = "black";

		let lastVert = Vec.ZERO;
		let boldOn = false;;
		let circle = 0.04;

		g.lineWidth = Var.THIN_TILE_STROKE;

		g.beginPath();
		Polygon.forEachEdge(6, false, (vert, prev, idx) => {
			// if (idx >= 3) { return; }
			if (idx === 0) { g.moveTo(prev.x, prev.y); }
			else { lastVert = vert; }

			if (idx > 0) { g.stroke(); }
			boldOn = true;
			g.lineWidth = boldOn ? Var.BOLD_TILE_STROKE : Var.THIN_TILE_STROKE;

			g.beginPath();
			g.ellipse(prev.x, prev.y, circle, circle, 0, 0, Util.PI2);
			g.fill();
			
			g.beginPath();
			g.moveTo(prev.x, prev.y);
			
			g.lineTo(vert.x, vert.y);
		});

		g.stroke();
		if (boldOn) {
			g.beginPath();
			g.ellipse(lastVert.x, lastVert.y, circle, circle, 0, 0, Util.PI2);
			g.fill();
		}

	}

	public static ORDER = [
		new Vec(1, -1),
		new Vec(1, 0),
		new Vec(0, 1),
		new Vec(-1, 1),
		new Vec(-1, 0),
		new Vec(0, -1),
	];

	forSurrounding(cb: (pos: Vec, idx: number) => boolean | void) {
		let i = 0;
		for (let v of Piece.ORDER) {
			if (cb(new Vec(this.axial.x + v.x, this.axial.y + v.y), i++)) {
				return;
			}
		}
	}

	equals(other: Piece) {
		return this.axial.equals(other.axial);
	}

	clone() {
		let tile = new Piece(this.axial, this.player, this.bug);
		tile.cart = this.cart;
		return tile;
	}

}