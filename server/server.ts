import { Server } from "ws";
import { Client, ClientMessage } from "./client";
import { Var } from "../src/state/var";
import { Board } from "../src/state/board";
import { Move, Moves } from "../src/mechanics/moves";
import { Vec } from "../src/vec";

export class Manager {

	pending?: ServerMatch;

	connect(client: Client) {
		if (!this.pending) {
			this.pending = new ServerMatch(2);
		}

		let match = this.pending;
		match.addPlayer(client);
		if (match.ready()) {
			delete this.pending;
			match.start();
		}
	}

}
export class ServerMatch {

	static matches: { [UUID: string]: ServerMatch } = {};
	static UUID = 0;

	private id = ++ServerMatch.UUID;
	private timeout!: NodeJS.Timeout;
	
	private started = false;

	private clients: Client[] = [];
	private replaceable: number[] = [];

	private board: Board;

	constructor(private requiredPlayers: number) {
		this.board = new Board(2);
		ServerMatch.matches[this.id] = this;
		console.log(`Lobby ${this.id} created, ${Object.keys(ServerMatch.matches).length} total.`);
	}

	ready() {
		return this.clients.length - this.replaceable.length === this.requiredPlayers;
	}

	addPlayer(client: Client) {
		let pn = this.clients.length

		if (this.replaceable.length) {
			pn = this.replaceable.splice(this.replaceable.length - 1)[0];
			this.clients[pn] = client;
		} else {
			this.clients.push(client);
		}

		const playerCount = this.clients.length - this.replaceable.length
		console.log(`Player added to lobby ${this.id}. (${playerCount} / ${this.requiredPlayers})`);

		client.playerNumber = pn;
		client.receiver = this.handler.bind(this);

		client.sendMessage("init", pn);
		this.broadcast("waiting", playerCount);
	}

	broadcast(type: string, data?: any, except?: Client) {
		// Do it once to save on stringifications and object inits
		let packet = Client.package(type, data);
		this.clients.forEach(c => {
			if (except !== c) {
				c.sendPacket(packet);
			}
		});
	}

	handler(message: ClientMessage) {
		switch(message.type) {
		case "close":
			this.playerLeft(message.client);
		break;
		case "move":
			this.move(message);
		break;
		case "chat":
			this.chat(message);
		break;
		}
	}

	chat(m: ClientMessage) {
		if (m.data && m.data.length <= 60) {
			this.broadcast("chat", m.data, m.client);
		} else {
			m.client.sendMessage("chat", "INVALID MESSAGE");
		}
	}

	playerLeft(client: Client) {
		console.log("Player Removed");
		if (this.started) {
			this.clients.splice(this.clients.indexOf(client), 1);
			this.broadcast("close", client.playerNumber);

			if (this.clients.length === 0) {
				// All players have left the game
				delete ServerMatch.matches[this.id];
				console.log(`Lobby ${this.id} destroyed, ${Object.keys(ServerMatch.matches).length} total.`);
			} else {
				this.board.winner = this.clients[0].playerNumber;
			}
		} else {
			this.replaceable.push(client.playerNumber);
		}
	}

	move(m: ClientMessage) {
		if (!this.started) {
			console.log("Bad move - match not started");
			return;
		}

		try {
			const move: Move = new Move(
				m.client.playerNumber, // Stop the haxurz
				// Doing it this way eliminates anything extra the player might have sent
				m.data.bug,
				Vec.fromData(m.data.dest) as Vec,
				Vec.fromData(m.data.src),
			);

			if (move.bug && move.dest && Moves.make(this.board, move)) {
				this.broadcast("move", move, m.client);
				this.setTimer();
			} else {
				throw new Error("Invalid Move: " + JSON.stringify(m));
			}
		} catch (e) {
			console.log(e);
		}
	
	}

	start() {
		this.started = true;
		this.broadcast("start");
		this.setTimer();
		console.log(`Match ${this.id} Started`);
	}

	setTimer() {
		if (this.timeout) { clearTimeout(this.timeout); }
		if (this.board.winner !== undefined) {
			this.timeout = setTimeout(() => {
				if (this.board.winner !== undefined) {
					this.broadcast("move", Moves.makeRandomMove(this.board));
				}
			}, Var.SECONDS_PER_TURN * 1000);
		}
	}

}

let port = Var.PORT;
if (process.argv[2] && !isNaN(+process.argv[2])) { port = +process.argv[2]; }
const wss = new Server({port: port});

const manager = new Manager();
wss.on("connection", client => manager.connect(new Client(<any> client)));

console.log("Server Online :" + port);