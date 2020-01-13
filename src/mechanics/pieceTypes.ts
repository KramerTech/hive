export enum Bug {
	B = "bee",
	A = "ant",
	H = "hopper",
	S = "spider",
	T = "beetle",
	L = "lady",
	M = "mosqito"
}

export const Bugs: Bug[] = [];
for (const bug of Object.values(Bug)) {
	Bugs.push(bug as Bug);
}
