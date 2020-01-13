import { Tile } from "../state/tile";
import { Util } from "../util";
import { Polygon } from "./polygons";
import { Color } from "./colors";

export class Draw {

	static tile(
		tile: Tile,
		g: CanvasRenderingContext2D,
		hover: boolean,
	) {
		// let type = tile.pieceType;
		let scale = hover ? 0.7 : 0.55;
		g.scale(scale, scale);

		Polygon.draw(g, 6, true);
		g.fillStyle = Color.bugs[tile.bug];
		g.fill();

		// Polygon.draw(g, type + 2, true);
		// g.strokeStyle = "black";
		// g.stroke();

		// g.rotate(Math.PI);
		// tile.draw(g);

		g.font = "bold .55px arial";

		g.textAlign = "center";
		g.textBaseline = "middle";

		g.shadowColor = "black";
		g.shadowOffsetX = 0;
		g.shadowOffsetY = 0
		g.shadowBlur = 4;

		Draw.drawStat(g, "X: " + tile.axial.x, true);
		g.rotate(Util.degToRad(60));
		Draw.drawStat(g, "Y: " + tile.axial.y);
		// g.rotate(Util.degToRad(-120));
		// Draw.drawStat(g, tData.upkeep + " 🛠");
	}

	static drawStat(g: CanvasRenderingContext2D, stat: string, top?: boolean) {
		let y = 0.82 * (top ? -1 : 1.04);
		g.fillStyle = "black";
		g.fillText(stat, 0.04, y + 0.04);
		g.fillStyle = "white";
		g.fillText(stat, 0, y);
	}

}