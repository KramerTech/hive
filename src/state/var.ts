import { Util } from "../util";

export class Var {

	public static STARTING_TURNS = 5;
	public static SECONDS_PER_TURN = 120;

	public static THIN_TILE_STROKE = 0.02;
	public static BOLD_TILE_STROKE = 0.08;
	public static PIECE_STROKE = 0.05;
	
	public static CORRUPTION_WIDTH = 0.9;
	public static CORRUPTION_SHRINK = 0.25;
	public static CORRUPTION_SPACING = 0.32;
	public static CORRUPTION_THICKNESS = 0.125;
	public static HALF_CORRUPTION_THICKNESS = Var.CORRUPTION_THICKNESS / 2;

	public static PIECE_PRICE = 10;
	public static CASTLE_PRICE = 15;

	public static MAX_STRENGTH = 4;

	public static BLINK_TIME = 1;
	public static BLINKS = 3;
	public static BLINK_OFF = 0.6;
	public static PER_BLINK = Var.BLINK_TIME / Var.BLINKS;

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