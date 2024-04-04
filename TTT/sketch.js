const cells = document.querySelectorAll(".cell");
const players = document.querySelectorAll(".player");
const statusText = document.querySelector("#statusText");

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// sets all Game settings

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer;
let human;
let CPU;
let characters = ["X", "O"];
let running = false;
let AImadeTurn = false;
let arr1 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let indices = createIndicesArray(arr1.length);


// selecting a player at the start

function runGame() {
    players.forEach(player => player.addEventListener("click", choosePlayer));
}

function choosePlayer() {
    const playerIndex = +this.getAttribute("playerIndex");
    human = characters[playerIndex];
    currentPlayer = human;
    CPU = (human == characters[0]) ? characters[1] : characters[0];
    console.log(`You are "${human}" and the CPU is "${CPU}"`);
    startNewGame();
}

// Game starts

function startNewGame() {
    selectScreen.classList.add("hidden");
    container.classList.remove("hidden");
    cells.forEach(cell => cell.addEventListener("click", cellClicked));
    statusText.textContent = `${currentPlayer}'s turn`;
    running = true;
}

// Once cell is clicked, cell gets updated and a check will be made of the current game status

function cellClicked() {
    const cellIndex = +this.getAttribute("cellIndex");

    if (options[cellIndex] != "" || !running) {
        return;
    }

    updateCell(this, cellIndex);
    checkGameStatus();
    
    if (running) {
        console.log("AIturn being activated")
        AImadeTurn = false;
        setInterval(AIturn, 250);
    }
}

// cell gets updated

function updateCell(cell, index) {
    options[index] = currentPlayer;
    cell.textContent = currentPlayer;

    if (currentPlayer == CPU) {
        console.log("Move by CPU")
        AImadeTurn = true;
    }
    else {
        console.log("Move by human")
    }
}

// change Player once game was checked

function changePlayer() {
    currentPlayer = (currentPlayer == human) ? CPU : human;
    statusText.textContent = `${currentPlayer}'s turn`;
}

// Minimax algorithm to find best move in tree branch

function minimax(options, depth, isMaximizing) {

    console.log(`Visited: ${depth}`);
    const scores = {
        X: -1,
        O: 1,
        tie: 0
    };
    
    const result = AIcheckGame();
    if (result !== null) {
        console.log(`Result found: ${result}`);
        return scores[result];
    }

    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < options.length; i++) {
        if (options[i] === "") {
            options[i] = isMaximizing ? "O" : "X";
            bestScore = isMaximizing ? Math.max(bestScore, minimax(options, depth + 1, false)) : Math.min(bestScore, minimax(options, depth + 1, true));
            options[i] = "";
            if ((isMaximizing && bestScore === 1) || (!isMaximizing && bestScore === -1)) {
                console.log("Returned early");
                return bestScore;
            }
        }
    }
    return bestScore;
}

// best move for the AI gets chosen

function bestMove() {
    let move = null;
    if (CPU === "O") {
        let bestScore = -Infinity;
        while (indices.length > 0) {
            const randomIndex = getRandomIndex(indices.length - 1);
            const i = arr1[indices[randomIndex]];
            if (options[i] === "") {
                options[i] = CPU;
                let score = minimax(options, 0, false);
                options[i] = "";
    
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                    if (score === 1) {
                        console.log("Returned early");
                        indices = createIndicesArray(arr1.length);
                        return move;
                    }
                }
            }
            indices.splice(randomIndex, 1);
        }
        indices = createIndicesArray(arr1.length);
        return move;
    }
    else if (CPU === "X") {
        let bestScore = Infinity;
        while (indices.length > 0) {
            const randomIndex = getRandomIndex(indices.length - 1);
            const i = arr1[indices[randomIndex]];
            if (options[i] === "") {
                options[i] = CPU;
                let score = minimax(options, 0, true);
                options[i] = "";
    
                if (score < bestScore) {
                    bestScore = score;
                    move = i;
                    if (score === -1) {
                        console.log("Returned early");
                        indices = createIndicesArray(arr1.length);
                        return move;
                    }
                }
            }
            indices.splice(randomIndex, 1);
        }
        indices = createIndicesArray(arr1.length);
        return move;
    }
    else {
        return move;
    }
}

// the calculated move is inserted into the updateCell function, afterwards it will be checked if the game is over

function AIturn() {
    if (!AImadeTurn) {
        const move = bestMove();
        updateCell(cells[move], move);
        checkGameStatus();
    }
}

// the same as checking the game but changes aren't made

function AIcheckGame () {
    let roundWon = false;
    let winningPlayer = null;
    
    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const cellA = options[condition[0]];
        const cellB = options[condition[1]];
        const cellC = options[condition[2]];

        if (cellA == "" || cellB == "" || cellC == "") {
            continue;
        }
        if (cellA == cellB && cellB == cellC) {
            roundWon = true;
            winningPlayer = cellA;
            break;
        }
    }

    if (roundWon){
        return winningPlayer; // Return winning player
    }

    return options.includes("") ? null : "tie"; // Return null for no winner, "tie" for a tie
}

// check the game and ends it if there is a winner or a draw. If the game isn't over, it calls upon the changePlayer()

function checkGameStatus() {
    let roundWon = false;
    let winningCombo = null;
    
    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const cellA = options[condition[0]];
        const cellB = options[condition[1]];
        const cellC = options[condition[2]];

        if (cellA == "" || cellB == "" || cellC == "") {
            continue;
        }
        if (cellA == cellB && cellB == cellC) {
            roundWon = true;
            winningCombo = condition;
            break;
        }
    }

    if (roundWon){
        statusText.textContent = `${currentPlayer} wins!`;
        highlightWinningCombo(winningCombo);
        running = false;
    }
    else if (!options.includes("")) {
        statusText.textContent = `Draw!`;
        highlightWinningCombo(winningCombo);
        running = false;
    }
    else {
        changePlayer();
    }
}

// an extra feature to highlight the cells where 

function highlightWinningCombo(winningCombo) {
    if (winningCombo !== null) {
        winningCombo.forEach(index => {
            cells[index].classList.add(`${currentPlayer}-wins`);
        });
    }
    else {
        cells.forEach(cell => {
            cell.classList.add("draw")
        });
    }
}

// restarts the game

function resetGame() {
    options = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove(`${currentPlayer}-wins`);
        cell.classList.remove("draw");
    });
    running = true;
    selectScreen.classList.remove("hidden");
    container.classList.add("hidden");
    runGame();
}

// Function to generate a random index between 0 and maxIndex (inclusive)
function getRandomIndex(maxIndex) {
    return Math.floor(Math.random() * (maxIndex + 1));
}

// Function to create an array of indices from 0 to length - 1
function createIndicesArray(length) {
    return Array.from({ length }, (_, index) => index);
}

// Loop through the array randomly
function loopRandomly() {
    while (indices.length > 0) {
        const randomIndex = getRandomIndex(indices.length - 1);
        const randomElement = arr1[indices[randomIndex]];
        console.log(randomElement);
        indices.splice(randomIndex, 1);
    }

    // Reset indices to the initial order for reuse
    indices = createIndicesArray(arr1.length);
}

runGame();