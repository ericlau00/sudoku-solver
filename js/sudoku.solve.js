export default class SudokuSolve {

    constructor(board) {
        this._solved = false;
        this._circulation = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this._board = board;
    }

    solve() {
        this._generateSolution();
        return this._board;
    }

    _generateSolution() {
        if (this._board.lastIsNg()) { }
        else if (this._board.accept()) { this._solved = true; }
        else {
            this._circulation.forEach((digit) => {
                if (!this._solved) {
                    this._board.populate(digit);
                    this._generateSolution();
                    if (!this._solved) this._board.depopulate();
                }
            });
        }
    }
}
