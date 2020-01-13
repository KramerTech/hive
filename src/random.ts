import { mersenne, uniformIntDistribution, RandomGenerator } from "pure-rand";

export class Rand {

	private generator: RandomGenerator;

	constructor(seed: number) {
		this.generator = mersenne(seed);
	}

	next(range: number): number;
	next(low: number, high: number): number;
	next(lowOrHigh: number, high?: number): number {
		if (!high) {
			high = lowOrHigh;
			lowOrHigh = 0;
		}
		let rand = uniformIntDistribution(lowOrHigh, high - 1, this.generator);
		this.generator = rand[1];
		return rand[0];
	}

}