import { Main } from "./main";
import { Move } from "./mechanics/move";
import { Game } from "./state/game";
import { MoveDesc } from "./state/moves";
import { Infographic } from "./ui/infographic";

let ogExec = Move.exec;
export class Network {

	private static ws: WebSocket;
	private static updateFlag = false;

	public static endTurn() {
		this.ws.send(JSON.stringify({type: "turn"}));
	}


	private static connect(url: string, port: number) {
		this.ws = new WebSocket("ws://" + url + ":" + port);

		Move.exec = (game: Game, move: MoveDesc, repo?) => {
			let ret = ogExec(game, move, repo);
			if (Network.updateFlag) { return; }
			if (!repo && !ret) {
				move = move.wire();
				this.ws.send(JSON.stringify({
					type: "move",
					data: move
				}));
			}
			return ret;
		}


		this.ws.onopen = ev => {
			console.log(ev);
		};

		this.ws.onmessage = message => {
			let data = message.data;
			if (!data) { return; }
			console.log(message.data);
			data = JSON.parse(data);
			switch (data.type) {
			case "init":
				Infographic.setPlayer(data.player, data.players);
				break;
			case "waiting":
				Infographic.setCount(data.count);
				break;
			case "start": 
				Infographic.setTimer(data.timeout);
				Main.controller.newGame(data.seed, data.players);
				break;
			case "turn":
				Infographic.setTimer(data.timeout);
				Network.updateFlag = true;
				Main.controller.input.reset();
				Main.controller.match.nextTurn(data.moves);
				Network.updateFlag = false;
				Infographic.setCount(0);
				break;
			}
		};
	}

	static start() {
		let conn = new URLSearchParams(window.location.search);
		let url = conn.get("url") || "goof.ddns.net";
		let port = +(conn.get("port") || 8888);
		console.log(url, port);
		this.connect(url, port);
	}

}

Network.start();