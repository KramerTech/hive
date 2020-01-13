import { Game } from "./state/game";
import { Graphics } from "./ui/graphics";
import { Input } from "./ui/input";
import { Moves } from "./mechanics/moves";
import { getBestMove } from "./ai/evaluator";

export class Main {

	public static controller = new Main();

	public game!: Game;

	// network: Network;

	graphics!: Graphics
	input!: Input;

	constructor() {
		// this.network = new Network();
		this.newGame(2);
	}

	public newGame(players: number) {
		this.game = new Game(players);
		this.setGame();
		setInterval(() => {
			console.log('moving');
			let move = getBestMove(this.game.board, 3);
			console.log(move);
			Moves.make(this.game.board, move);
		}, 5000)
	}

	public nextTurn() {
		this.game.nextTurn();
		this.setGame();		
	}
	
	public setGame() {
		if (this.graphics) {
			this.graphics.game = this.game;
			this.input.game = this.game;
		} else {
			console.log("Initialized");
			this.graphics = new Graphics(this.game);
			this.input = new Input(this.game);
		}
	}

}
