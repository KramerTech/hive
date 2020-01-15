import { Graphics } from "./ui/graphics";
import { Input } from "./ui/input";
import { Moves } from "./mechanics/moves";
import { getBestMove } from "./ai/evaluator";
import { Board } from "./state/board";
import { PiecePool } from "./state/pool";

export class Main {

	public static controller = new Main();

	public game!: Board;

	// network: Network;

	graphics!: Graphics
	input!: Input;

	constructor() {
		// this.network = new Network();
		this.newGame(2);
	}

	public newGame(players: number) {
		this.game = new Board(players);
		this.setGame();

		(window as any)["ai"] = (depth: number) => {
			let move = getBestMove(this.game, depth);
			console.log(move);
			Moves.make(this.game, move);
		}
	}

	public nextTurn() {
		this.game.nextTurn();
		this.setGame();		
	}
	
	public setGame() {
		if (this.graphics) {
			this.graphics.board = this.game;
			this.input.board = this.game;
		} else {
			console.log("Initialized");
			this.graphics = new Graphics(this.game);
			this.input = new Input(this.game);
		}
	}

}
