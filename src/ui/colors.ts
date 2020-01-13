import { Bug } from "../mechanics/pieceTypes";

export class Color {

	hex!: string;
	r!: number;
	g!: number;
	b!: number;

	constructor(hex: string);
	constructor(r: number, g: number, b: number, a?: number);
	constructor(
		rOrHex: number | string,
		g?: number,
		b?: number,
	) {
		if (typeof rOrHex === "string") {
			this.hex = rOrHex;
			this.calcRGB();
		} else {
			this.r = rOrHex;
			this.g = g || 0;
			this.b = b || 0;
		}
	}

	public calcRGB() {
		let h = this.hex;
		this.r = parseInt(h.substring(1, 3), 16);
		this.g = parseInt(h.substring(3, 5), 16);
		this.b = parseInt(h.substring(5, 7), 16);
	}

	private chanelToHex(chanel: number) {
		let hex = Math.floor(chanel).toString(16);
		if (hex.length === 1) { return "0" + hex; }
		return hex;
	}

	public calcHex() {
		this.hex = `#${
			this.chanelToHex(this.r)
		}${
			this.chanelToHex(this.g)
		}${
			this.chanelToHex(this.b)
		}`;
	}

	public static player = [
		"#F2F2F2",
		"#3D3D3D",
	];

	public static bugs: {[key: string]: string} = {};

}

Color.bugs[Bug.Q] = "#DBB600";
Color.bugs[Bug.A] = "#0078D9";
Color.bugs[Bug.G] = "#007F0E";
Color.bugs[Bug.L] = "#FF0000";
Color.bugs[Bug.M] = "#A0A0A0";
Color.bugs[Bug.S] = "#5E3C33";
Color.bugs[Bug.B] = "#B200FF";

// for (let p of Color.player) {
// 	p.selected = new Color(p.main).lighten(p.light).hex;;
// }
