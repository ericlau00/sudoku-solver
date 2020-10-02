export default class SudokuBoard {

    constructor(text, svg) {

        this._board = new Array();
        this._prefill = new Array();
        this._ilast = 0;
        this._jlast = -1;
        this._svg = svg;
        this._size = this._svg.clientWidth;
        this._id = this._svg.id.replace('board', '');
        this._indel = 0; //number of insertions and deletions
        this._delay = 3;

        text = text.trim().split('\n');
        for (let i = 0; i < 9; i++) {
            this._board.push(new Array());
            for (let j = 0; j < 9; j++) {
                let digit = Number(text[i].substring(j, j + 1));
                this._board[i].push(digit);
                if (digit != 0) this._prefill.push(`${i},${j}`);
            }
        }

        this._drawBoard();
        this._drawPrefill();
    }

    _drawBoard() {
        this._svg.setAttribute('height', this._size);

        let _drawSquare = (x, y, size, i, j) => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('id', `${this._id}:${i},${j}`);

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', size);
            rect.setAttribute('height', size);
            rect.setAttribute('class', 'square');

            g.appendChild(rect);
            this._svg.appendChild(g);
        }

        for (let i = 0; i < 9; i++) {
            let shiftX = i * this._size / 9;
            let boxSize = this._size / 9;
            for (let j = 0; j < 9; j++) {
                _drawSquare(shiftX, j * this._size / 9, boxSize, j, i);
            }
        }
    }

    _drawPrefill() {
        this._prefill.forEach(point => {
            let coords = point.split(',').map(coord => { return Number(coord) });
            let digit = this._board[coords[0]][coords[1]];
            this._drawDigit(point, digit, 'prefill');
        });
    }

    _drawDigit(point, digit, type) {
        const g = document.getElementById(`${this._id}:${point}`);

        let rect = g.lastChild;
        let offset = Number(rect.getAttribute('width')) / 2;
        let x = Number(rect.getAttribute('x')) + offset ;
        let y = Number(rect.getAttribute('y')) + offset;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', type);
        text.textContent = digit;

        g.appendChild(text);
    }

    _removeDigit(point) {
        const g = document.getElementById(`${this._id}:${point}`)
        g.removeChild(g.lastChild);
    }

    lastIsNg() {
        if (this._jlast == -1) return false;
        return this._contradictSquare() || this._contradictHorizontal() || this._contradictVertical();
    }

    _contradictSquare() {
        let firstMajor = this._jlast >= 0 && this._jlast <= 2;
        let secondMajor = this._jlast >= 3 && this._jlast <= 5;
        if (this._ilast >= 0 && this._ilast <= 2) {
            if (firstMajor) return this._checkSquare(1, 1);
            else if (secondMajor) return this._checkSquare(1, 4);
            else return this._checkSquare(1, 7);
        }
        else if (this._ilast >= 3 && this._ilast <= 5) {
            if (firstMajor) return this._checkSquare(4, 1);
            else if (secondMajor) return this._checkSquare(4, 4);
            else return this._checkSquare(4, 7);
        }
        else {
            if (firstMajor) return this._checkSquare(7, 1);
            else if (secondMajor) return this._checkSquare(7, 4);
            else return this._checkSquare(7, 7);
        }
    }

    _checkSquare(i, j) {
        let count = 0;
        let board = this._board;
        let square = [
            board[i - 1][j - 1], board[i - 1][j], board[i - 1][j + 1],
            board[i][j - 1], board[i][j], board[i][j + 1],
            board[i + 1][j - 1], board[i + 1][j], board[i + 1][j + 1]
        ];
        square.forEach(digit => {
            if (board[this._ilast][this._jlast] == digit) count++;
        });
        return count != 1;
    }

    _contradictHorizontal() {
        let count = 0;
        for (let j = 0; j < 9; j++) {
            if (this._board[this._ilast][this._jlast] == this._board[this._ilast][j]) count++;
        }
        return count != 1;
    }

    _contradictVertical() {
        let count = 0;
        for (let i = 0; i < 9; i++) {
            if (this._board[this._ilast][this._jlast] == this._board[i][this._jlast]) count++;
        }
        return count != 1;
    }

    accept() {
        return this._isFilled() && !this.lastIsNg();
    }

    _isFilled() {
        for (let i = 0; i < this._board.length; i++) {
            for (let j = 0; j < this._board[i].length; j++) {
                if (this._board[i][j] == 0) return false;
            }
        }
        return true;
    }

    populate(digit) {
        this._increaseTile();
        while (this._prefill.indexOf(`${this._ilast},${this._jlast}`) != -1) this._increaseTile();
        this._board[this._ilast][this._jlast] = digit;

        this._indel++;
        let x = this._ilast
        let y = this._jlast;
        let i = this._indel;
        setTimeout(() => {
            this._drawDigit(`${x},${y}`, digit, 'fill');
        }, this._delay * i);
    }

    _increaseTile() {
        if (this._jlast == 8) {
            if (this._ilast != 8) {
                this._ilast += 1;
                this._jlast = 0;
            }
        }
        else this._jlast += 1;
    }

    depopulate() {
        while (this._prefill.indexOf(`${this._ilast},${this._jlast}`) != -1) this._decreaseTile();
        this._board[this._ilast][this._jlast] = 0;

        let x = this._ilast
        let y = this._jlast;
        this._indel++;
        let i = this._indel;
        setTimeout(() => {
            this._removeDigit(`${x},${y}`);
        }, this._delay * i);

        this._decreaseTile();
    }

    _decreaseTile() {
        if (this._jlast == 0) {
            this._jlast = 8;
            this._ilast -= 1;
        }
        else this._jlast -= 1;
    }

    getDelay() {
        return this._delay * this._indel;
    }
}