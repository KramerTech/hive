import { Bug } from "../mechanics/pieceTypes";

export class PiecePool {

	public pool: {[key: string]: number} = {};

    constructor() {
        this.pool[Bug.A] = 3;
        // this.pool.set(GRASSHOPPER, 3);
        // this.pool.set(SPIDER, 2);
        // this.pool.set(BEETLE, 2);
        // this.pool.set(BEE, 1);
        // this.pool.set(LADYBUG, 1);
        // this.pool.set(MOSQUITO, 1);
    }

    available(bug: Bug) {
        return this.pool[bug] > 0;
    }

    use(bug: Bug) {
        this.pool[bug]--;
    }

    clone() {
		const pool = new PiecePool();
		pool.pool = {};
		Object.assign(pool, this.pool);
        return pool;
    }

}