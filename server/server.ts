import { Server } from "ws";
import { Match } from "../src/state/match";
import { Client, ClientMessage } from "./client";
import { MoveDesc } from "../src/state/moves";
import { Var } from "../src/state/var";

export class Manager {

	games: ServerMatch[] = [];
	pending?: ServerMatch;

	connect(client: Client) {
		if (!this.pending) { this.pending = new ServerMatch(3); }

		let match = this.pending;
		match.addPlayer(client);
		if (match.ready()) {
			this.games.push(match);
			delete this.pending;
			match.start();
			console.log("Match Started");
		}
	}

}
export class ServerMatch {

	private timeoutIdx!: number;
	private timeout!: number;
	
	private started = false;
	private seed: number = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

	private players: Client[] = [];
	private replaceable: number[] = [];

	private match: Match;

	private turnComplete: boolean[];
	private turnCompleteCounter = 0;

	constructor(private requiredPlayers: number) {
		this.turnComplete = new Array(requiredPlayers);
		this.turnComplete.fill(false);	

		this.match = new Match(this.seed, requiredPlayers);
		console.log(this.seed);
	}

	ready() {
		return this.players.length - this.replaceable.length === this.requiredPlayers;
	}

	addPlayer(client: Client) {
		let pn = this.players.length

		if (this.replaceable.length) {
			pn = this.replaceable.splice(this.replaceable.length - 1)[0];
			this.players[pn] = client;
		} else {
			this.players.push(client);
		}

		console.log("Player Added");
		client.playerNumber = pn;
		client.receiver = this.handler.bind(this);
		client.init(pn, this.requiredPlayers);
		this.broadcast("waiting", {
			count: this.players.length - this.replaceable.length
		});
	}

	broadcast(type: string, data: any) {
		data.type = type;
		let packet = JSON.stringify(data);
		this.players.forEach(c => { c.sendPacket(packet); });
	}

	handler(message: ClientMessage) {
		switch(message.type) {
		case "close":
			this.playerLeft(message.client);
			break;
		case "turn":
			this.turn(message.client.playerNumber);
			break;
		case "move":
			this.move(message);
			break;
		}
	}

	playerLeft(client: Client) {
		console.log("Player Removed");
		if (this.started) {
			// TODO: tell everybody
		} else {
			this.replaceable.push(client.playerNumber);
		}
	}

	move(m: ClientMessage) {
		// Stop the haxurz
		m.data.player = m.client.playerNumber;

		let move = MoveDesc.restore(m.data);
		let failed = this.match.move(move);
		if (failed) {
			console.error("MOVE FAILED: ", move);
		}
	}

	turn(player: number) {
		if (this.turnComplete[player]) {
			console.error("Player ended turn twice");
			return;
		}

		console.log("Player " + player + " is ending his turn.");
		this.turnComplete[player] = true;
		this.turnCompleteCounter++;

		if (this.turnCompleteCounter < this.players.length) {
			this.broadcast("waiting", {count: this.turnCompleteCounter})
			return;
		}

		// Do turn stuff
		this.turnComplete.fill(false);
		this.turnCompleteCounter = 0;

		let moves: MoveDesc[][] = [];
		this.match.forGames(game => {
			moves.push(game.moves.marshal());
		});
		
		this.setTimer();
		this.match.nextTurn();
		this.broadcast("turn", {
			moves: moves,
			timeout: this.timeout
		});
	}

	start() {
		this.started = true;
		this.setTimer();
		this.broadcast("start", {
			seed: this.seed,
			players: this.requiredPlayers,
			timeout: this.timeout
		});
	}

	setTimer() {
		if (this.timeoutIdx) { clearTimeout(this.timeoutIdx); }
		
		let end = new Date();
		end.setSeconds(end.getSeconds() + Var.SECONDS_PER_TURN);
		this.timeout = end.getTime();
		console.log("Set timer for " + this.timeout);

		this.timeoutIdx = <any> setTimeout(() => {
			//TODO: race condition check
			this.players.forEach(c => this.turn(c.playerNumber));
		}, Var.SECONDS_PER_TURN * 1000);
	}

}


const wss = new Server({port: 8888});
let manager = new Manager();
wss.on("connection", client => manager.connect(new Client(<any> client)));
console.log("Server Online");