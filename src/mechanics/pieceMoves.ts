import { Bugs } from "./pieceTypes";
import { Piece } from "../state/piece";
import { Vec } from "../vec";
import { Board } from "../state/board";

type MoveGetter = (board: Board, axial: Vec, piece: Piece) => Vec[];

export class PieceMoves {

	static getters = {} as {[key in Bugs]: MoveGetter};

	static get(board: Board, piece: Piece, bug: Bugs = piece.bug, axial = piece.axial): Vec[] {
		// Disjoint graphs check
		// Can safely be ignored if moving a stacked piece
		if (piece.artPoint && piece.level === 0) { return []; }
		// Can only move after placing bee
		if (!board.beeDown(piece.player)) return [];
		return this.getters[bug](board, axial, piece) as Vec[];
	}

} 

/**
 * Grasshoppers can jump in a straight line over
 * 1 or more pieces until the first empty slot
 */
PieceMoves.getters[Bugs.HOPPER] = (board, axial) => {
	const moves: Vec[] = [];
	board.forSurroundingPieces(axial, (check, _, dir) => {
		const pos = check.axial.clone();
		// Traverse to first blank space
		do { pos.add(dir); }
		while (board.has(pos));

		moves.push(pos);
	});
	return moves;
}

PieceMoves.getters[Bugs.QUEEN] = (board, axial) => {
	const moves: Vec[] = [];
	board.forSurroundingSlots(axial, (pos, i) => {
		const back = Vec.add(axial, Piece.ORDER[(i + 5) % 6]);
		const forth = Vec.add(axial, Piece.ORDER[(i + 1) % 6]);
		let count = 0;
		if (board.has(back)) { count++; }
		if (board.has(forth)) { count++; }
		if (count === 1) {
			moves.push(pos);
		}
	});
	return moves;
}

PieceMoves.getters[Bugs.LADY] = (board, axial, piece) => {
	const moves: Map<string, Vec> = new Map<string, Vec>();
	board.forSurroundingPieces(axial, p1 => {
		board.forSurroundingPieces(p1.axial, p2 => {
			if (p2 === piece) { return; }
			board.forSurroundingSlots(p2.axial, (slot => {
				moves.set(slot.toString(), slot);
			}));
		});
	})	
	return Array.from(moves.values());
}

PieceMoves.getters[Bugs.SPIDER] = (board, axial, piece) => {
	const moves: Map<string, Vec> = new Map<string, Vec>();
	const addBack = board.tmpRemove(piece);
	for (const p1 of PieceMoves.get(board, piece, Bugs.QUEEN)) {
		for (const p2 of PieceMoves.get(board, piece, Bugs.QUEEN, p1)) {
			if (p2.equals(axial)) { continue; }
			for (const p3 of PieceMoves.get(board, piece, Bugs.QUEEN, p2)) {
				if (p3.equals(p1) || p3.equals(axial)) { continue; }
				moves.set(p3.toString(), p3);
			}
		}
	}
	addBack();
	return Array.from(moves.values());
}

PieceMoves.getters[Bugs.ANT] = (board, axial) => {
	const moves: Vec[] = [];
	const prevMoves: Set<string> = new Set<string>();
	prevMoves.add(axial.x + axial.y * 10000 + '');
	const active: Vec[] = [axial];
	while (active.length > 0) {
		const curPos = active.pop() as Vec;
		const curMoves: Vec[] = [];
		Piece.forSurrounding(curPos, (pos, i) => {
			if (board.get(pos)) { return; }
			const back = Vec.add(curPos, Piece.ORDER[(i + 5) % 6]);
			const forth = Vec.add(curPos, Piece.ORDER[(i + 1) % 6]);
			let count = 0;
			if (board.get(back) && !back.equals(axial)) { count++ }
			if (board.get(forth) && !forth.equals(axial)) { count++ }
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

PieceMoves.getters[Bugs.MOSQUITO] = (board, axial, piece) => {
	// If stacked up, move like a beetle
	if (piece.level > 0) { return PieceMoves.get(board, piece, Bugs.BEETLE); }

	const moves: Map<string, Vec> = new Map();
	const checked = new Set<Bugs>();

	// Mark mosquito as already checked so we don't get into an infinte loop
	checked.add(Bugs.MOSQUITO);
	
	// For each piece we're touching, acquire that piece's moves
	board.forSurroundingPieces(axial, check => {
		if (!checked.has(check.bug)) {
			checked.add(check.bug);
			const newMoves = PieceMoves.get(board, piece, check.bug);
			newMoves.forEach(m => moves.set(m.toString(), m));
		}
	});

	return Array.from(moves.values());
}

PieceMoves.getters[Bugs.BEETLE] = (board, axial, piece) => {
	const moves: Vec[] = [];

	// While crawling, we can move anywhere
	if (piece.level > 0) {
		Piece.ORDER.forEach(v => moves.push(Vec.add(v, axial)));
		return moves;
	}

	// While on the ground, we can hop onto any piece
	board.forSurroundingPieces(axial, check => {
		moves.push(check.axial);
	});

	// Or we can move just like a queen
	PieceMoves.get(board, piece, Bugs.QUEEN).forEach(m => moves.push(m));

	return moves;
}