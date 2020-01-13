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
		this.board = new Board(players, this.rand);

		for (let i = 0; i < players; i++) {
			this.pools.push(new PiecePool(player));
		}
	}

	nextTurn() {
		this.board.nextTurn();
	}
	
}