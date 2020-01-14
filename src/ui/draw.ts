import { Piece } from "../state/piece";
import { Color } from "./colors";
import { Polygon } from "./polygons";
import { Vec } from "../vec";
import { Var } from "../state/var";
import { Util } from "../util";

export class Draw {

	static piece(
		piece: Piece,
		g: CanvasRenderingContext2D,
		hover: boolean,
		top: boolean,
	) {
		let color = Color.player[piece.player];
		
		g.fillStyle = color;
		g.strokeStyle = "black";
		
		if (piece.level > 0) {
			Polygon.forEachEdge(6, false, (vert, prev, i) => {
				if (i % 2 === 0) { return; }
				g.beginPath();
				g.moveTo(prev.x, prev.y);
				g.lineTo(0, 0);
				g.lineTo(vert.x, vert.y);
				g.fill();
				g.stroke();
			});
		} else {
			Polygon.draw(g, 6, false);
			g.fill();
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


		let scale = (hover && top) ? 0.7 : 0.55;

		g.scale(scale, scale);

		Polygon.draw(g, 6, true);
		g.fillStyle = Color.bugs[piece.bug];
		g.fill();

		// g.font = "bold .55px arial";

		// g.textAlign = "center";
		// g.textBaseline = "middle";

		// g.shadowColor = "black";
		// g.shadowOffsetX = 0;
		// g.shadowOffsetY = 0
		// g.shadowBlur = 4;

		// Draw.drawStat(g, "X: " + tile.axial.x, true);
		// g.rotate(Util.degToRad(60));
		// Draw.drawStat(g, "Y: " + tile.axial.y);
	}

	static drawStat(g: CanvasRenderingContext2D, stat: string, top?: boolean) {
		let y = 0.82 * (top ? -1 : 1.04);
		g.fillStyle = "black";
		g.fillText(stat, 0.04, y + 0.04);
		g.fillStyle = "white";
		g.fillText(stat, 0, y);
	}

}