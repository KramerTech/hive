import { Board, Move } from "./board"
import { ANT, SPIDER, BEE } from "./piece";

export default function TestHive() {
    testSomeMoves()
    console.log('tests completed');
}

function testSomeMoves() {
    let b = new Board(10, 10);
    b.executeMove(new Move(null, [5,5], ANT));
    b.executeMove(new Move(null, [5,6], SPIDER));
    b.executeMove(new Move(null, [4,4], BEE));
    b.executeMove(new Move(null, [6,7], BEE));
    b.executeMove(new Move(null, [3,3], ANT));
    b.executeMove(new Move(null, [7,8], ANT));
    b.executeMove(new Move([3,3], [7,7], ANT));
    assert(b.whitePiecePool.pool.get(ANT) === 1, 'White ANTS not deducted from pool properly');
    assert(b.blackPiecePool.pool.get(ANT) === 2, 'Black ANTS not deducted from pool properly');
    assert(b.pieces.pieces.length === 6, 'PIECES array is the wrong length');
    console.log(b.toString());
}

function assert(v, msg) {
    if (!v) {
        console.log(msg)
    }
}