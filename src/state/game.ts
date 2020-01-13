import { Board } from "./board";
import { Rand } from "../random";

export class Game {

	public board: Board;
	private rand: Rand;

	constructor(
		public players = 2,
		public seed = Math.random() * 1000000,
	) {
		this.rand = new Rand(seed);
		this.board = new Board(players, 20, 20, this.rand);
	}

	nextTurn() {
		this.board.nextTurn();
	}
	
}