import { Util } from "../util";

export class Var {

	public static SECONDS_PER_TURN = 120;

	public static THIN_TILE_STROKE = 0.02;
	public static BOLD_TILE_STROKE = 0.08;
	public static PIECE_STROKE = 0.05;

	public static MIN_SCALE = 2.8;
	public static MAX_SCALE = 280;
	public static SCALE_SPEED = 1.15;

	public static NEXT_TURN_SPEED = 2;
	public static ROTATIONS = [
		[],
		[0],
		[180, 0],
		[120, 240, 0],
		[60, 120, 180, 0],
		[60, 120, 180, 240, 0],
		[60, 120, 180, 240, 300, 0]
	];

}

Var.ROTATIONS.forEach((playerRow, i) => {
	playerRow.forEach((deg, j) => {
		Var.ROTATIONS[i][j] = Util.degToRad(deg);
	});
});