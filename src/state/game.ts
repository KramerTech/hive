import { Board } from "./board";
import { Rand } from "../random";

export class Game {

	public turn = 0;
	public currentPlayer = 0;
	public board: Board;
	private rand: Rand;

	constructor(
		public players = 2,
		public seed = Math.random() * 1000000,
	) {
		this.rand = new Rand(seed);
		this.board = new Board(players, this.rand);
	}

	nextTurn() {
		this.turn++;
		this.currentPlayer++;
		this.currentPlayer %= this.players;
	}
	
}