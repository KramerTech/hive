export enum Bug {
	Q = "queen",
	A = "ant",
	G = "hopper",
	S = "spider",
	B = "beetle",
	L = "ladybug",
	M = "mosquito"
}

export const Bugs: Bug[] = [];
for (const bug of Object.values(Bug)) {
	Bugs.push(bug as Bug);
}
