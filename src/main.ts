import { Board } from "./state/board";
import { Graphics } from "./ui/graphics";
import { Input } from "./ui/input";
import { Network } from "./network";

export class Main {

	public static controller = new Main();

	public game!: Board;

	network!: Network;
	graphics!: Graphics
	input!: Input;

	constructor() {
		this.network = new Network();
		this.graphics = new Graphics();
		this.input = new Input();
	}

}
