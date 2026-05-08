let game = new Game12(2, 2);

const STATUS = {
    CONTINUE: "continue",
    WIN: "win",
    INVALID: "invalid",
    INVALID_SKIP: "invalid-skip",
    GAME_OVER: "game-over",
    MUST_MOVE_FIRST: "must-move-first"
};

class Dice {
    constructor(cardsCount) {
        this.cardsCount = cardsCount;
        this.values = [];
        this.sum = 0;
    }

    roll() {
        this.values = [];
        for (let i = 0; i < this.cardsCount; i++) {
            const value = Math.floor(Math.random() * 6) + 1;
            this.values.push(value);
        }
        this.sum = this.values.reduce((acc, cur) => acc + cur, 0);
    }
}

class Player {
    constructor(name, cards) {
        this.name = name;
        this.cards = [...cards];
    }

    hasCard(value) {
        return this.cards.includes(value);
    }

    removeCard(value) {
        this.cards = this.cards.filter(card => card !== value);
    }

    removeCards(values) {
        this.cards = this.cards.filter(card => !values.includes(card));
    }

    hasWon() {
        return this.cards.length === 0;
    }
}

class Game12 {
    constructor(diceCount, playersCount) {
        this.diceCount = diceCount;
        this.playersCount = playersCount;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.dice = new Dice(this.diceCount);
        for (let i = 0; i < this.playersCount; i++) {
            const name = `Player ${i + 1}`;
            const cards = this.generateCards();
            this.players.push(new Player(name, cards));
        }
        this.awaitingMove = false;
        this.gameOver = false;
    }

    switchPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    generateCards() {
        let array = [];
        for (let i = 1; i <= this.diceCount * 6; i++) {
            array.push(i);
        }
        return array;
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    rollDice() {
        if (this.awaitingMove) {
            return STATUS.MUST_MOVE_FIRST;
        }
        if (this.gameOver) {
            return STATUS.GAME_OVER;
        }

        this.dice.roll();
        this.awaitingMove = true;
        return {
            values: this.dice.values,
            sum: this.dice.sum,
        };
    }

    clearDice() {
        this.dice.values = [];
        this.dice.sum = 0;
    }

    getAvailableMoves() {
        const player = this.getCurrentPlayer();
        const values = this.dice.values;

        const uniqueValues = [...new Set(values)];
        const singles = uniqueValues.filter(value => player.hasCard(value));
        const canUseSum = player.hasCard(this.dice.sum);

        return {
            singles: singles,
            canUseSum: canUseSum,
        };
    }

    playMove(type) {
        if (this.gameOver) {
            return STATUS.GAME_OVER;
        }

        const player = this.getCurrentPlayer();
        const moves = this.getAvailableMoves();

        if (type === "singles") {
            if (moves.singles.length === 0) {
                return STATUS.INVALID;
            }
            player.removeCards(moves.singles);
            this.awaitingMove = false;
        } else if (type === "sum") {
            if (!moves.canUseSum) {
                return STATUS.INVALID;
            }
            player.removeCard(this.dice.sum);
            this.awaitingMove = false;
        } else {
            return STATUS.INVALID;
        }

        if (player.hasWon()) {
            this.clearDice();
            this.gameOver = true;
            this.awaitingMove = false;
            return STATUS.WIN;
        }

        this.clearDice();
        this.switchPlayer();
        return STATUS.CONTINUE;
    }

    skipMove() {
        if (!this.awaitingMove || this.gameOver) {
            return STATUS.INVALID_SKIP;
        }

        this.clearDice();
        this.awaitingMove = false;
        this.switchPlayer();
        return STATUS.CONTINUE;
    }
}

const drawButton = document.getElementById("draw");
const resetButton = document.getElementById("reset");
const updatePlayersButton = document.getElementById("updatePlayers");
const playerCountInput = document.getElementById("playerCount");
const diceDiv = document.getElementById("Dice");
const gameFieldDiv = document.getElementById("GameField");
const gameStatusDiv = document.getElementById("gameStatus");

function updateGameStatus() {
    if (game.gameOver) {
        gameStatusDiv.textContent = `Status: Finished - Winner: ${game.getCurrentPlayer().name}`;
    } else if (game.awaitingMove) {
        gameStatusDiv.textContent = game.dice.values.length > 0 ? `Roll: ${game.dice.values.join(" & ")}` : "";
    } else {
        gameStatusDiv.textContent = `Status: Ready to start`;
    }
}

function renderDice() {
    diceDiv.innerHTML = "";
    drawButton.disabled = game.awaitingMove || game.gameOver;

    if (game.dice.values.length === 0) {
        diceDiv.innerHTML = "Ready to play";
        return;
    }

    const diceText = game.dice.values.join(" & ");
    const moves = game.getAvailableMoves();

    const infoText = document.createElement("div");
    infoText.textContent = `Player ${game.getCurrentPlayer().name}: ${diceText}`;
    infoText.style.marginBottom = "15px";
    diceDiv.appendChild(infoText);

    renderMoveButtons(moves);
}

function renderMoveButtons(moves) {
    if (moves.singles.length > 0) {
        const singlesBtn = document.createElement("button");
        singlesBtn.classList.add("move-btn");
        if (moves.singles.length === 2) {
            singlesBtn.textContent = moves.singles[0] + " & " + moves.singles[1];
        } else {
            singlesBtn.textContent = moves.singles[0];
        }
        singlesBtn.addEventListener("click", () => {
            const result = game.playMove("singles");
            handleMoveResult(result);
        });
        diceDiv.appendChild(singlesBtn);
    }

    if (moves.canUseSum) {
        const sumBtn = document.createElement("button");
        sumBtn.textContent = game.dice.sum;
        sumBtn.classList.add("move-btn");
        sumBtn.addEventListener("click", () => {
            const result = game.playMove("sum");
            handleMoveResult(result);
        });
        diceDiv.appendChild(sumBtn);
    }

    if (moves.singles.length === 0 && !moves.canUseSum) {
        const skipBtn = document.createElement("button");
        skipBtn.classList.add("move-btn", "secondary");
        skipBtn.textContent = "Skip Turn";
        skipBtn.addEventListener("click", () => {
            const result = game.skipMove();
            handleMoveResult(result);
        });
        diceDiv.appendChild(skipBtn);
    }
}

function renderPlayers() {
    gameFieldDiv.innerHTML = "";

    game.players.forEach((player, index) => {
        const playerDiv = document.createElement("div");
        playerDiv.classList.add("player-card");

        if (index === game.currentPlayerIndex && !game.gameOver) {
            playerDiv.classList.add("active");
        }

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("player-name");
        nameDiv.textContent = `${player.name} (${player.cards.length} cards)`;
        playerDiv.appendChild(nameDiv);

        const cardsDiv = document.createElement("div");
        cardsDiv.classList.add("cards");

        player.cards.forEach((card) => {
            const cardDiv = document.createElement("div");
            cardDiv.classList.add("card");
            cardDiv.textContent = card;
            cardsDiv.appendChild(cardDiv);
        });
        playerDiv.appendChild(cardsDiv);

        gameFieldDiv.appendChild(playerDiv);
    });
}

function showWinner(winnerName) {
    setTimeout(() => {
        const overlay = document.createElement("div");
        overlay.className = "game-overlay";
        overlay.innerHTML = `
                <div class="winner-message">
                    🎉 ${winnerName} wins! 🎉
                </div>
            `;
        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.remove();
        }, 3000);
    }, 100);
}

function renderAll() {
    renderPlayers();
    renderDice();
    updateGameStatus();
}

function handleMoveResult(result) {
    if (result === STATUS.CONTINUE) {
        renderAll();
        return;
    }
    if (result === STATUS.WIN) {
        const winner = game.getCurrentPlayer();
        renderAll();
        showWinner(winner.name);
        return;
    }
    if (result === STATUS.INVALID) {
        alert("Invalid move");
    }
    if (result === STATUS.INVALID_SKIP) {
        alert("Cannot skip turn");
    }
}

drawButton.addEventListener("click", () => {
    const result = game.rollDice();
    if (result === STATUS.MUST_MOVE_FIRST) {
        alert("Make a move first");
        return;
    }
    if (result === STATUS.GAME_OVER) {
        return;
    }
    renderAll();
});

resetButton.addEventListener("click", () => {
    if (!game.gameOver) {
        const confirmRestart = confirm("Are you sure you want to restart?");
        if (!confirmRestart) {
            return;
        }
    }
    const playerCount = parseInt(playerCountInput.value);
    game = new Game12(2, playerCount);
    renderAll();
});

updatePlayersButton.addEventListener("click", () => {
    const count = parseInt(playerCountInput.value);
    if (count >= 2 && count <= 6) {
        game = new Game12(2, count);
        renderAll();
    } else {
        alert("Please enter a number between 2 and 6");
    }
});

renderAll();