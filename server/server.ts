import * as WebSocket from "ws";
import { Server } from "ws";
import { Client, Receiver } from "../src/rtc/client";
import { Manager } from "../src/rtc/host";
import { Var } from "../src/state/var";

class WebsocketClient extends Client {

	static UUID = 1;

	public id = Client.UUID++;
	public playerNumber!: number;
	public receiver!: Receiver;

	constructor(private socket: WebSocket) {
		super();
		socket.on("close", () => {
			this.disconnect();
			socket.close();
		});
		socket.on("message", data => this.receive(data));
	}

	sendPacket(packet: string) {
		this.socket.send(packet);
	}

}

let port = Var.PORT;
if (process.argv[2] && !isNaN(+process.argv[2])) { port = +process.argv[2]; }
const wss = new Server({port: port});

const manager = new Manager();
wss.on("connection", client => manager.connect(new WebsocketClient(<any> client)));

console.log("Server Online :" + port);