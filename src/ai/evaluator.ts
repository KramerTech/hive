import { Moves, Move } from "../mechanics/moves";
import { Board } from "../state/board";
import { Bugs } from "../mechanics/pieceTypes";
import { Vec } from "../vec";

export function evaluate(board: Board) {
    const surroundPenalty = 1;
    const possiblePenalty = .1;

    let score = 0;
    let wbee = board.getPiecesByType(Bugs.QUEEN, 0);
    let bbee = board.getPiecesByType(Bugs.QUEEN, 1);
    let wOpen = 6;
    let bOpen = 6;
    if (wbee.length === 1) {
        let moves = Moves.getAllMoves(board, 1);
        const wSur: Vec[] = [];
        wbee[0].forSurrounding(pos => {
            if (board.get(pos)) {
                score -= surroundPenalty;
                wOpen--;
            } else {
                wSur.push(pos);
            }
        });
        moves.forEach(move => {
            for (let sur of wSur) {
                if (move.dest.equals(sur)) {
                    score -= possiblePenalty / wOpen;
                }
            }
        });
    } else {
    }
    if (bbee.length === 1) {
        let moves = Moves.getAllMoves(board, 0);
        const bSur: Vec[] = [];
        bbee[0].forSurrounding(pos => {
            if (board.get(pos)) {
                score += surroundPenalty;
                bOpen--;
            } else {
                bSur.push(pos);
            }
        });
        moves.forEach(move => {
            for (let sur of bSur) {
                if (move.dest.equals(sur)) {
                    score += possiblePenalty / bOpen;
                }
            }
        });
    } else {
    }
    if (wOpen === 0 && bOpen === 0) {
        return 0;
    }
    if (wOpen === 0) {
        return -1000;
    }
    if (bOpen === 0) {
        return 1000;
    }

    return score;
}

export function evaluateDepth(board: Board, depth: number): number {
    if (depth === 0) {
        return evaluate(board);
    }
    const moves = Moves.getAllMoves(board);
    let min = board.currentPlayer === 0 ? -10000 : 10000;
    moves.forEach(move => {
        const newBoard = board.clone();
        newBoard.applyMove(move);
        let v = evaluateDepth(newBoard, depth - 1);
        if (board.currentPlayer === 0) {
            min = Math.max(min, v);
        } else {
            min = Math.min(min, v);
        }
    });
    return min;
}

export function getBestMove(board: Board, depth: number): Move {
    const moves = Moves.getAllMoves(board);
    let min = board.currentPlayer === 0 ? -10000 : 10000;
    let minMove: Move | undefined;
    moves.forEach(move => {
        const newBoard = board.clone();
        newBoard.applyMove(move);
        let v = evaluateDepth(newBoard, depth - 1);
        if (board.currentPlayer === 0) {
            if (v > min) {
                min = v;
                minMove = move;
            }
        } else {
            if (v < min) {
                min = v;
                minMove = move;
            }
        }
    });
    return minMove as Move;
}

export function evaluateDepthSparse(board: Board, max: number, depth: number): number {
    if (depth === 0) {
        return evaluate(board);
    }
    const moves = Moves.getAllMoves(board);
    let min = board.currentPlayer === 0 ? -10000 : 10000;

    const sortMoves = moves.map(move => {
        const newBoard = board.clone();
        newBoard.applyMove(move);
        let v = evaluate(newBoard);
        return {move: move, board: newBoard, value: v};
    });
    sortMoves.sort((a, b) => a.value - b.value);
    if (board.currentPlayer === 0) {
        sortMoves.reverse();
    }
    const topMoves = sortMoves.slice(0, max)

    topMoves.forEach(move => {
        let v = move.value;
        if (move.value < 500 && move.value > -500 && depth > 1) {
            v = evaluateDepthSparse(move.board, max, depth - 1);
        }
        if (board.currentPlayer === 0) {
            min = Math.max(min, v);
        } else {
            min = Math.min(min, v);
        }
    });
    return min * .99;
}

export function getBestMoveSparse(board: Board, max: number, depth: number): Move {
    const moves = Moves.getAllMoves(board);
    let min = board.currentPlayer === 0 ? -10000 : 10000;
    let minMove: Move | undefined;

    moves.sort(() => Math.random() - .5);

    moves.forEach(move => {
        const newBoard = board.clone();
        newBoard.applyMove(move);
        let v = evaluateDepthSparse(newBoard, max, depth - 1);
        if (board.currentPlayer === 0) {
            if (v > min) {
                min = v;
                minMove = move;
            }
        } else {
            if (v < min) {
                min = v;
                minMove = move;
            }
        }
    });
    return minMove as Move;
}