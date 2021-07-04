import { DataConnection } from "peerjs";
import { Env } from "../state/env";
import { ServerConnection } from "./client";

export class PeerSocket implements ServerConnection {

	private conn!: DataConnection;

	constructor(hostId: string) {
		const peer = Env.peer!;
		if (peer.id) {
			this.init(hostId);
		} else {
			peer.on("open", () => this.init(hostId));
			peer.on("error", error => {
				console.log(error);
				this.onclose()
			});
		}
	}

	private init(peerId: string) {
		const peer = Env.peer!;
		this.conn = peer.connect(peerId, { reliable: true });
		this.conn.on("open", () => {
			this.onopen();
			this.conn.on("close", () => this.onclose());
			this.conn.on("data", data => this.onmessage({data}));
			this.conn.on("error", error => {
				console.log(error);
				this.onclose();
			});
		});
	}

	send(data: string): void {
		this.conn.send(data);
	}

	close() { this.conn.close(); }

	// UI overrides these methods for callbacks
	onmessage = (_: any) => {};
	onopen = () => {};
	onclose = () => {};

}

