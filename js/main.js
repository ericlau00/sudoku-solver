import SudokuBoard from './sudoku.board.js';
import SudokuSolve from './sudoku.solve.js';

const svgBoards = document.getElementById('boards');

$.get('sudoku-selected.txt', async (res) => {
    let problems = res.split(/Grid\s\d{2}/);
    problems.shift();

    for (const problem of problems) {
        const num = svgBoards.childElementCount - 1;
        await displaySolve(num, problem);
        await sleep(1500);
    }
});

const createSVG = (num) => {
    svgBoards.innerHTML += frame(
        `<svg class="board" id="board${num}" style="border: 1px solid;"></svg>`,
        `container${num}`);

    return document.getElementById(`board${num}`);
}

const frame = (body, id) => {
    return `
    <div class="container-fluid vh-100">
        <div class="row min-vh-100 justify-content-center align-items-center" id="${id}">
            ${body}
        </div>
    </div>`
}

const sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

const displaySolve = async (num, problem) => {
    let board = new SudokuBoard(problem, createSVG(num));

    let container = document.getElementById(`container${num}`);
    window.scrollTo(0, container.offsetTop);

    await sleep(1000);

    let solution = new SudokuSolve(board).solve();

    await sleep(solution.getDelay() + 1000);

    return container;
}
