import { Var } from "../state/var";

export class Countdown {

	private static timeout: NodeJS.Timeout;
	private static startTime: number;

	static reset() {
		if (this.timeout) {
			clearInterval(this.timeout);
		}
		this.update();
	}

	public static start() {
		this.reset();
		this.startTime = (new Date()).getTime();
		this.timeout = setInterval(() => {
			const elapsed = (new Date()).getTime() - this.startTime;
			this.update(Math.floor(elapsed / 1000));
		}, 100);
	}

	private static update(elapsed = 0) {
		const timer = document.getElementById("timer") as HTMLDivElement;
		timer.innerHTML = Math.max(0, Var.SECONDS_PER_TURN - elapsed) + "";
	}

}

Countdown.reset();