import { Env } from "./state/env";
import { Moves, Move } from "./mechanics/moves";
import { Board } from "./state/board";
import { Var } from "./state/var";
import { Vec } from "./vec";
import { Toasts } from "./toasts";

export class Network {

	private static ws: WebSocket;
	private static init = false;
	private static boundReconnect: any;

	public static endTurn() {
		this.ws.send(JSON.stringify({type: "turn"}));
	}

	public static chat(text: string) {
		Toasts.chat(text, true);
		this.ws.send(JSON.stringify({
			type: "chat",
			data: text,
		}));
	}

	public static move(board: Board, move: Move) {
		if (Moves.make(board, move)) {
			this.ws.send(JSON.stringify({
				type: "move",
				data: move
			}));
			if (board.winner !== undefined) {
				let toast: string;
				if (board.winner === Env.player) {
					toast = "You Won!";
				} else {
					toast = "You lost. Better luck next time.";
				}
				toast += " Click to play again.";
				Toasts.show(toast, this.boundReconnect);
			} else if (Env.player === board.currentPlayer) {
				Toasts.show("Your opponent does not have any moves, so you get to go again.");
			} else {
				Toasts.show("Move accepted. Please wait for your opponent to take their turn.");
			}
			return true;
		}
		return false;
	}

	private static connect(url: string, port: number, secure: boolean) {
		Env.gameStarted = false;
		Env.board = new Board(2);
		Env.turnRotation = 0;

		console.log(url, port);
		Toasts.show("Attempting to connect to game server...");
		this.ws = new WebSocket(`ws${secure ? 's' : ''}://` + url + ":" + port);

		this.ws.onopen = ev => {
			console.log(ev);
		};

		this.ws.onmessage = message => {
			let payload = message.data;
			if (!payload) { return; }

			let toast: string | undefined = undefined;
			let clickCallback: any;

			payload = JSON.parse(payload);
			switch (payload.type) {
			case "move":
				const move = payload.data;
				move.src = Vec.fromData(move.src);
				move.dest = Vec.fromData(move.dest);
				Moves.make(Env.board, move);
				if (Env.board.winner !== undefined) {
					clickCallback = this.boundReconnect
					if (Env.board.winner === Env.player) {
						toast = "You Won!";
					} else {
						toast = "You lost. Better luck next time.";
					}
					toast += " Click to play again";
				} else if (move.player === Env.player) {
					toast = "You took too long to move, so a random move was made for you. Now it's your opponent's turn.";
				} else if (Env.board.currentPlayer !== Env.player) {
					toast = "You have no available moves, so your opponent will move again.";
				} else {
					toast = "It's your turn! Right click to scroll through pieces, then left click on a highlighted hex to place one.<br>";
					if (Env.board.beeDown()) {
						toast += "Or, click and drag to move your pieces that are already on the field.";
					} else if (Math.floor(Env.board.turn / 2) >= Var.BEE_DOWN_BY - 1) {
						toast += "Your bee must be placed by the fourth turn, so do that now.";
					}
				}
			break;
			case "init":
				Env.player = +payload.data;
				toast = "Connected to server. Waiting for an opponent to join.";
			break;
			case "start":
				if (Env.player === 0) {
					toast = "Game started. Right click to scroll through pieces, then left click on a highlighted hex to place one.";
				} else {
					toast = "Game started. You go second. Please wait while your opponent makes the first move."
				}
				Env.gameStarted = true;
			break;
			case "chat":
				Toasts.chat(payload.data, false);
			break;
			}

			if (toast) { Toasts.show(toast, clickCallback); }
		};

		this.ws.onclose = event => {
			const message = this.init ? "Connection to server lost." : "Could not connect to server.";
			Toasts.show(message + " Click to retry.", this.boundReconnect);
		}

		Env.makeMove = this.move.bind(this);
	}

	static start() {
		let conn = new URLSearchParams(window.location.search);
		let url = conn.get("url") || "skramer.dev";
		let port = +(conn.get("port") || Var.PORT);
		let secure = conn.get("insecure") === null;
		this.boundReconnect = this.connect.bind(this, url, port, secure);
		this.boundReconnect();
	}

}

Network.start();

const chatWindow = document.getElementById("chat") as HTMLTextAreaElement;
chatWindow.onkeyup = (event) => {
	if (event.keyCode === 13) {
		if (chatWindow.value.trim().length) {
			Network.chat(chatWindow.value);
			chatWindow.value = "";
		}
		return false;
	}
	return true;
};