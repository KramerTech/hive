import { Moves } from "../src/state/moves";
import * as WebSocket from "ws";

export type ClientMessage = {client: Client, type: "turn" | "move" | "close", data?: any};
export type Receiver = (m: ClientMessage) => void;

export class Client {

	static UUID = 1;

	public id = Client.UUID++;
	public playerNumber!: number;
	public turn = false;
	public receiver!: Receiver;
	
	constructor(private socket: WebSocket) {
		socket.on("close", () => {
			this.receiver({
				client: this,
				type: "close",
			});
			// console.log(code, reason);
		});
		socket.on("message", data => {
			let message = JSON.parse(data.toString());
			if (!message.type) { console.error("No type!"); return; }
			this.receiver({
				client: this,
				type: message.type,
				data: message.data
			});
		});
	}

	sendTurn(moveSets: Moves[]) { 
		console.log(moveSets);
		this.socket.send("Hi Friend");
	}

	init(player: number, players: number) {
		this.socket.send(JSON.stringify({
			"type": "init",
			"player": player,
			"players": players,
		}));
	}

	sendPacket(packet: string) {
		this.socket.send(packet);
	}


}