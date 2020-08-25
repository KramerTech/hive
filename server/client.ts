import * as WebSocket from "ws";

export type ClientMessage = {client: Client, type: string, data?: any};
export type Receiver = (m: ClientMessage) => void;

export class Client {

	static UUID = 1;

	public id = Client.UUID++;
	public playerNumber!: number;
	public receiver!: Receiver;
	
	constructor(private socket: WebSocket) {
		socket.on("close", () => {
			this.receiver({
				client: this,
				type: "close",
			});
			socket.close();
		});
		socket.on("message", data => {
			try {
				let message = JSON.parse(data.toString());
				if (message.type && message.data) {
					// This is a protected keyword for the server
					if (message.type === "close") { return; }
					this.receiver({
						client: this,
						type: message.type,
						data: message.data
					});
				}
			} catch (error) {
				console.log(error);
			}
		});
	}

	static package(type: string, data?: any): string {
		return JSON.stringify({
			type: type,
			data: data,
		});
	}

	sendPacket(packet: string) {
		this.socket.send(packet);
	}

	sendMessage(type: string, data?: any) {
		this.sendPacket(Client.package(type, data));
	}

}