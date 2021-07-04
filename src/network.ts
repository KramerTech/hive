import { Move, Moves } from "./mechanics/moves";
import { ServerConnection } from "./rtc/client";
import { PeerSocket } from "./rtc/peer";
import { Board } from "./state/board";
import { Env } from "./state/env";
import { Var } from "./state/var";
import { Toasts } from "./toasts";
import { Countdown } from "./ui/countdown";
import { Vec } from "./vec";
import copy from "copy-to-clipboard";

export class Network {

	private static ni: ServerConnection;
	private static init = false;

	private static boundReconnect: any;
	private static boundRematch: any;
	private static boundCopy: any;

	public static chat(text: string) {
		Toasts.chat(text, true);
		this.ni.send(JSON.stringify({
			type: "chat",
			data: text,
		}));
	}

	public static move(board: Board, move: Move) {
		if (Moves.make(board, move)) {
			this.ni.send(JSON.stringify({
				type: "move",
				data: move
			}));
			if (board.winner !== undefined) {
				let toast: string;
				if (board.winner === Env.player) {
					toast = "You Won!";
				} else if (Env.board.winner === -1) {
					toast = "That's a draw!"
				} else {
					toast = "You lost. Better luck next time.";
				}
				toast += " Click to play again.";
				Toasts.show(toast, this.boundRematch);
			} else if (Env.player === board.currentPlayer) {
				Toasts.show("Your opponent does not have any moves, so you get to go again.");
			} else {
				Toasts.show("Move accepted. Please wait for your opponent to take their turn.");
			}
			Env.board.winner === undefined ? Countdown.start() : Countdown.reset();
			return true;
		}
		return false;
	}

	private static reset() {
		Env.gameStarted = false;
		Env.board = new Board(2);
		Env.turnRotation = 0;
	}

	private static connect(url: string) {
		
		this.reset();
		
		// Loopback will only exist if we're hosting
		if (Env.loopback) {
			this.ni = Env.loopback;
		} else {
			// Else we need to make an actual connection
			this.ni = Env.serverMode ? new WebSocket(url) : new PeerSocket(Env.hostID);
		}

		Toasts.show("Attempting to connect to game server...");

		this.ni.onopen = ev => {
			console.log(ev);
		};

		this.ni.onmessage = message => {
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
					clickCallback = this.boundRematch
					if (Env.board.winner === Env.player) {
						toast = "You Won!";
					} else if (Env.board.winner === -1) {
						toast = "That's a draw!"
					} else {
						toast = "You lost. Better luck next time.";
					}
					toast += " Click to play again";
				} else if (move.player === Env.player) {
					toast = "You took too long to move, so a random move was made for you.";
					if (Env.board.currentPlayer !== Env.player) {
						toast += " Now it's your opponent's turn.";
					}
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
				Env.board.winner === undefined ? Countdown.start() : Countdown.reset();
			break;
			case "init":
				Env.player = +payload.data;
				if (Env.loopback) {
					toast = `You are currently hosting a lobby. Click here to copy your lobby link, then share it with your opponent.`;
					clickCallback = this.boundCopy;
				} else {
					toast = "Connected to server. Waiting for an opponent to join.";
				}
			break;
			case "start":
				if (this.rematchWait) {
					this.reset();
					this.rematchWait = false;
				}
				if (Env.player === 0) {
					toast = "Game started. Right click to scroll through pieces, then left click on a highlighted hex to place one.";
				} else {
					toast = "Game started. You go second. Please wait while your opponent makes the first move."
				}
				Env.gameStarted = true;
				Countdown.start();
			break;
			case "close":
				toast = "You opponent just disconnected.";
				if (Env.board.winner === undefined) {
					Env.board.winner = Env.player;
					toast += " I guess that means you win!";
				}
				toast += " Click to play again.";
				clickCallback = this.boundRematch;
				Countdown.reset();
			break;
			case "chat":
				Toasts.chat(payload.data, false);
			break;
			}

			if (toast) { Toasts.show(toast, clickCallback); }
		};

		this.ni.onclose = event => {
			let message = this.init ? "Connection to server lost." : "Could not connect to server.";
			message += " Click to retry.";
			if (!this.init && !Env.loopback && !Env.serverMode) {
				message += "<br>(You probably need to ask your opponent for a new link.)";
			}
			Toasts.show(message, this.boundReconnect);
		}

		Env.makeMove = this.move.bind(this);
	}

	private static rematchWait = false;
	static rematch() {
		this.rematchWait = true;
		Toasts.show("Waiting for opponent to accept...");
		this.ni.send(JSON.stringify({type: "rematch", data: true}));
	}

	static copy() {
		copy(Env.hostURL);
		Toasts.show("Link copied. Click here to copy again.", this.boundCopy);
	}

	static start() {
		let args = new URLSearchParams(window.location.search);
		let url = window.location.href;

		let override = args.get("url");
		if (override) {
			url = override;
		} else if (url.includes("localhost")) {
			url = "ws:" + url.split(":")[1] + ":" + Var.PORT;
		} else {
			url = url.replace("https://", "wss://");
			url = url.replace("http://", "ws://");
			if (!url.endsWith("/")) { url += "/"; }
			url += "ws";
		}
		this.boundCopy = this.copy.bind(this);
		this.boundRematch = this.rematch.bind(this);
		this.boundReconnect = this.connect.bind(this, url);
		this.boundReconnect();
	}

}

const chatWindow = document.getElementById("chat") as HTMLTextAreaElement;
chatWindow.onkeyup = (event) => {
	if (event.keyCode === 13) {
		if (chatWindow.value.trim().length) {
			Network.chat(chatWindow.value);
		}
		chatWindow.value = "";
	}
	return true;
};