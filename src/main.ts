import { Graphics } from "./ui/graphics";
import { Input } from "./ui/input";
import { Moves } from "./mechanics/moves";
import { getBestMove } from "./ai/evaluator";
import { Board } from "./state/board";
import { Rand } from "./random";

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
		const seed = Math.floor(Math.random() * 1000000);
		console.log(seed);
		this.game = new Board(players, 26, 26, new Rand(seed));
		this.setGame();

		(window as any)["ai"] = (depth: number) => {
			let move = getBestMove(this.game, depth);
			console.log(move);
			Moves.make(this.game, move);
		}

		// for (let i = 0; i < 10; i++) {
		// 	(window as any).ai(2);
		// }
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
