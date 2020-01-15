import { Bugs } from "../mechanics/pieceTypes";

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

Color.bugs[Bugs.QUEEN] = "#DBB600";
Color.bugs[Bugs.ANT] = "#0078D9";
Color.bugs[Bugs.HOPPER] = "#007F0E";
Color.bugs[Bugs.LADY] = "#FF0000";
Color.bugs[Bugs.MOSQUITO] = "#A0A0A0";
Color.bugs[Bugs.SPIDER] = "#5E3C33";
Color.bugs[Bugs.BEETLE] = "#B200FF";

// for (let p of Color.player) {
// 	p.selected = new Color(p.main).lighten(p.light).hex;;
// }
