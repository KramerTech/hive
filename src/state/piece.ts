import { Color } from "../ui/colors";
import { Polygon } from "../ui/polygons";
import { Util } from "../util";
import { Vec } from "../vec";
import { Var } from "./var";
import { Bug } from "../mechanics/pieceTypes";
import { Slot } from "./slot";

export class Piece {

	public cart!: Vec;
	public axial!: Vec;
	public level = 0;
	
	public hover = false;
	public drag = false;

	public index!: number;

	constructor(
		public player: number,
		public bug: Bug,
	) {
	}

	update(axial: Vec) {
		this.axial = axial;
		this.cart = Util.axialToCartesian(axial);
	}

	draw(g: CanvasRenderingContext2D) {
		let color = Color.player[this.player];
		
		g.fillStyle = color;
		g.strokeStyle = "black";
		
		if (this.level === 0) {
			Polygon.draw(g, 6, false);
			g.fill();
		} else {
			Polygon.forEachEdge(6, false, (vert, prev, i) => {
				if (i % 2 === 0) { return; }
				g.beginPath();
				g.moveTo(prev.x, prev.y);
				g.lineTo(0, 0);
				g.lineTo(vert.x, vert.y);
				g.fill();
				g.stroke();
			});
		}

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

	forSurrounding(cb: (pos: Vec, idx: number, dir: Vec) => boolean | void) {
		Slot.forSurrounding(this.axial, cb);
	}

	equals(other: Piece) {
		return this.axial.equals(other.axial);
	}

	clone() {
		let piece = new Piece(this.player, this.bug);
		piece.axial = this.axial;
		return piece;
	}

}