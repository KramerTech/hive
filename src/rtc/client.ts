import Peer from "peerjs";

export type ClientMessage = { client: Client, type: string, data?: any };
export type Receiver = (m: ClientMessage) => void;

export interface ServerConnection {

	send(data: string): void;
	close(): void;

	onmessage: ((ev: MessageEvent) => any) | null;
	onopen: ((ev: Event) => any) | null;
	onclose: ((ev: CloseEvent) => any) | null
}


export abstract class Client {

	static UUID = 1;

	public id = Client.UUID++;
	public playerNumber!: number;
	public receiver!: Receiver;

	static package(type: string, data?: any): string {
		return JSON.stringify({
			type: type,
			data: data,
		});
	}

	abstract sendPacket(packet: string);
	
	sendMessage(type: string, data?: any) {
		this.sendPacket(Client.package(type, data));
	}

	disconnect() {
		this.receiver({
			client: this,
			type: "close",
		});
	}

	receive(data: any) {
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
	}

}

export class PeerClient extends Client {

	constructor(private conn: Peer.DataConnection) {
		super()
		conn.on("close", () => this.disconnect());
		conn.on("data", data => this.receive(data));
	}

	sendPacket(packet: string) {
		this.conn.send(packet);
	}

}

export class Loopback extends Client implements ServerConnection {

	// Called by the UI to communicate with the host
	send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
		const parsed: ClientMessage = JSON.parse(data as string);
		this.receiver({
			client: this,
			type: parsed.type,
			data: parsed.data,
		});
	}

	// Called by the host to communicate with the UI
	sendPacket(data: string) {
		this.onmessage({data} as any);
	}
	
	// UI sets this to receive messages
	onmessage(data: MessageEvent) {};

	// Won't be used b/c we live inside the host
	close() {}
	onopen() {}
	onclose() {}

}