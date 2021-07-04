import { Network } from "./network";
import { Manager } from "./rtc/host";
import { Board } from "./state/board";
import { Env } from "./state/env";
import { Graphics } from "./ui/graphics";
import { Input } from "./ui/input";

export class Main {

	public static controller = new Main();

	public game!: Board;

	network!: Network;
	graphics!: Graphics
	input!: Input;

	constructor() {
		if (!Env.serverMode) {
			const peer = new URLSearchParams(window.location.search).get("peer");
			if (peer) {
				Env.hostID = peer;
			} else {
				const manager = new Manager();
				manager.host();
			}
		}

		Network.start();
		this.graphics = new Graphics();
		this.input = new Input();
	}

}
