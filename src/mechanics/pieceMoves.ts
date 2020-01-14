import { Bugs } from "./pieceTypes";
import { Piece } from "../state/piece";
import { Vec } from "../vec";
import { Board } from "../state/board";
import { Slot } from "../state/slot";

type MoveGetter = (board: Board, piece: Piece) => Vec[];

export class PieceMoves {

	static getters = {} as {[key in Bugs]: MoveGetter};

	static get(board: Board, piece: Piece, bug: Bugs = piece.bug): Vec[] {
		if (!board.bees[piece.player]) return [];
		return this.getters[bug](board, piece) as Vec[];
	}

} 

/**
 * Grasshoppers can jump in a straight line over
 * 1 or more pieces until the first empty slot
 */
PieceMoves.getters[Bugs.HOPPER] = (board, piece) => {
	const moves: Vec[] = [];
	piece.forSurrounding((pos, _, dir) => {
		// Need to hop over at least one piece
		if (!board.get(pos)) { return; }

		// Traverse to first blank space
		do { pos.add(dir); }
		while (board.get(pos));

		moves.push(pos);
	});

	return moves;
}

PieceMoves.getters[Bugs.QUEEN] = (board, piece) => {
	const moves: Vec[] = [];
	piece.forSurrounding((pos, i) => {
		if (board.get(pos)) { return; }
		const back = Vec.add(piece.axial, Slot.ORDER[(i + 5) % 6]);
		const forth = Vec.add(piece.axial, Slot.ORDER[(i + 1) % 6]);
		let count = 0;
		if (board.get(back)) { count++; }
		if (board.get(forth)) { count++; }
		if (count === 1) {
			moves.push(pos);
		}
	});
	return moves;
}

PieceMoves.getters[Bugs.LADY] = (board, piece) => {
	const moves: Map<string, Vec> = new Map<string, Vec>();
	piece.forSurrounding(pos => {
		const p1 = board.get(pos);
		if (!p1) { return; }
		p1.forSurrounding(pos2 => {
			const p2 = board.get(pos2);
			if (!p2 || p2 === piece) { return; }
			p2.forSurrounding(pos3 => {
				if (!board.get(pos3)) {
					moves.set(pos3.x + pos3.y * 10000 + '', pos3);
				}
			})
		});
	})	
	return Array.from(moves.values());
}

PieceMoves.getters[Bugs.SPIDER] = (board, piece) => {
	const moves: Vec[] = [];
	const prevMoves: Set<string> = new Set<string>();
	prevMoves.add(piece.axial.x + piece.axial.y * 10000 + '');
	const active: any[] = [{d: 0, p: piece.axial}];
	while (active.length > 0) {
		const curAct = active.pop();
		const curPos = curAct.p;
		const curMoves: Vec[] = [];
		Slot.forSurrounding(curPos, (pos, i) => {
			if (board.get(pos)) { return; }
			const back = Vec.add(curPos, Slot.ORDER[(i + 5) % 6]);
			const forth = Vec.add(curPos, Slot.ORDER[(i + 1) % 6]);
			let count = 0;
			if (board.get(back) && !back.equals(piece.axial)) { count++ }
			if (board.get(forth) && !forth.equals(piece.axial)) { count++ }
			if (count === 1) {
				curMoves.push(pos);
			}
		});
		curMoves.forEach((move: Vec) => {
			const k = move.x + move.y * 10000 + '';
			if (!prevMoves.has(k)) {
				prevMoves.add(k);
				if (curAct.d === 2) {
					moves.push(move);
				} else {
					active.push({d: curAct.d+1, p: move});
				}
			}
		});
	}
	return moves;
}

PieceMoves.getters[Bugs.ANT] = (board, piece) => {
	const moves: Vec[] = [];
	const prevMoves: Set<string> = new Set<string>();
	prevMoves.add(piece.axial.x + piece.axial.y * 10000 + '');
	const active: Vec[] = [piece.axial];
	while (active.length > 0) {
		const curPos = active.pop() as Vec;
		const curMoves: Vec[] = [];
		Slot.forSurrounding(curPos, (pos, i) => {
			if (board.get(pos)) { return; }
			const back = Vec.add(curPos, Slot.ORDER[(i + 5) % 6]);
			const forth = Vec.add(curPos, Slot.ORDER[(i + 1) % 6]);
			let count = 0;
			if (board.get(back) && !back.equals(piece.axial)) { count++ }
			if (board.get(forth) && !forth.equals(piece.axial)) { count++ }
			if (count === 1) {
				curMoves.push(pos);
			}
		});
		curMoves.forEach((move: Vec) => {
			const k = move.x + move.y * 10000 + '';
			if (!prevMoves.has(k)) {
				prevMoves.add(k);
				moves.push(move);
				active.push(move);
			}
		});
	}
	return moves;
}

PieceMoves.getters[Bugs.MOSQUITO] = (board, piece) => {
	if (piece.level > 0) {
		return PieceMoves.get(board, piece, Bugs.BEETLE);
	}

	const moves: Map<string, Vec> = new Map();
	const checked: {[key: string]: boolean} = {};

	// Mark mosquito as already checked so we don't get into an infinte loop
	checked[Bugs.MOSQUITO] = true;
	
	// For each piece we're touching, acquire that piece's moves
	piece.forSurrounding(pos => {
		const check = board.get(pos);
		if (check && !checked[check.bug]) {
			checked[check.bug] = true;
			const newMoves = PieceMoves.get(board, piece, check.bug);
			newMoves.forEach(m => moves.set(m.toString(), m));
		}
	});

	return Array.from(moves.values());
}

PieceMoves.getters[Bugs.BEETLE] = (board, piece) => {
	const moves: Vec[] = [];
	piece.forSurrounding((pos, i) => {
		if (piece.level > 0 || board.get(pos)) {
			moves.push(pos);
			return;
		}
		
		const back = Vec.add(piece.axial, Slot.ORDER[(i + 5) % 6]);
		const forth = Vec.add(piece.axial, Slot.ORDER[(i + 1) % 6]);
		let count = 0;
		if (board.get(back)) { count++; }
		if (board.get(forth)) { count++; }
		if (count === 1) {
			moves.push(pos);
		}
	});
	return moves;
}