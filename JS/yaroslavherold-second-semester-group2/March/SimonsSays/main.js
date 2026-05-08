const TOTAL_BUTTONS = 4;
const BUTTON_COLORS = ['btn-red', 'btn-green', 'btn-blue', 'btn-yellow', 'btn-orange', 'btn-purple'];
const HIGHLIGHT_DURATION = 200;
const SEQUENCE_PAUSE = 300;
const CLICK_FEEDBACK_DURATION = 150;
const DELAY_READY = 800;
const DELAY_GO = 600;
const NEXT_ROUND_DELAY = 1200;

class Game {
    constructor() {
        this.boardElement = document.querySelector('#gameBoard');
        this.startBtn = document.querySelector('#startGameBtn');
        this.newGameBtn = document.querySelector('#newGameBtn');

        this.sequenceGenerator = new SequenceGenerator(TOTAL_BUTTONS);
        this.storageManager = StorageManager;
        this.boardRenderer = new BoardRenderer(
            this.boardElement,
            (id) => this.handlePlayerClick(id),
            TOTAL_BUTTONS);
        this.boardRenderer.createButtons();

        this.currentLevel = 0;
        this.sequence = [];
        this.playerStep = 0;
        this.isPlayerTurn = false;
        this.isGameActive = false;

        this.setupEventListeners();
        this.boardRenderer.updateScore(0, this.storageManager.getBestScore());
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startNewGame());
        this.newGameBtn.addEventListener('click', () => this.resetGame());
    }

    startNewGame() {
        if (this.isGameActive) return;

        this.currentLevel = 0;
        this.sequence = [];
        this.playerStep = 0;
        this.isGameActive = true;

        this.boardRenderer.createButtons();
        const bestScore = this.storageManager.getBestScore();
        this.boardRenderer.updateScore(0, bestScore);

        this.startRound();
    }

    async startRound() {

        if (!this.isGameActive) return;

        this.currentLevel++;

        const bestScore = this.storageManager.getBestScore();
        this.boardRenderer.updateScore(this.currentLevel, bestScore);

        if (this.currentLevel === 1) {
            this.sequence = this.sequenceGenerator.generateSequence();
        } else {
            this.sequence = this.sequenceGenerator.generateSequence(this.sequence);
        }

        this.isPlayerTurn = false;
        this.boardRenderer.disableClick();

        await this.getReady()
        if (!this.isGameActive) return;

        await this.playSequence()
        if (!this.isGameActive) return;

        this.isPlayerTurn = true;
        this.playerStep = 0;
        this.boardRenderer.enableClick();
        this.boardRenderer.showMessage(`Твой ход! Повтори ${this.currentLevel} шаг`);
    }

    async getReady() {
        this.boardRenderer.showMessage('Приготовься...');
        await this.delay(DELAY_READY);
        if (!this.isGameActive) return;
        this.boardRenderer.showMessage('Ready?');
        await this.delay(DELAY_READY);
        if (!this.isGameActive) return;
        this.boardRenderer.showMessage('Set!');
        await this.delay(DELAY_READY);
        if (!this.isGameActive) return;
        this.boardRenderer.showMessage('GO!');
        await this.delay(DELAY_GO);
    }

    async playSequence() {
        if (!this.isGameActive) return;

        this.boardRenderer.showMessage(`Запоминай: ${this.currentLevel} шаг`);

        for (let i = 0; i < this.sequence.length; i++) {
            const buttonId = this.sequence[i];
            await this.boardRenderer.highlightElement(buttonId, HIGHLIGHT_DURATION);
            await this.delay(SEQUENCE_PAUSE);
        }
    }

    delay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    handlePlayerClick(buttonId) {
        if (!this.isPlayerTurn || !this.isGameActive) return;

        const exceptedButton = this.sequence[this.playerStep];

        if (buttonId === exceptedButton) {
            this.playerStep++;

            this.boardRenderer.highlightElement(buttonId, CLICK_FEEDBACK_DURATION);

            if (this.playerStep >= this.sequence.length) {
                this.boardRenderer.showMessage(`Уровень ${this.currentLevel} пройден!`);
                this.isPlayerTurn = false;
                this.boardRenderer.disableClick();

                setTimeout(() => this.startRound(), NEXT_ROUND_DELAY);
            }
        } else {
            this.endGame();
        }
    }

    endGame() {
        this.isGameActive = false;
        this.isPlayerTurn = false;
        this.boardRenderer.disableClick();

        const passedLevel = this.currentLevel - 1;
        const bestScore = this.storageManager.getBestScore();
        const isNewRecord = this.storageManager.saveBestScore(passedLevel);

        if (isNewRecord) {
            this.boardRenderer.showMessage("ИГРА ОКОНЧЕНА! НОВЫЙ РЕКОРД: " + passedLevel);

            this.boardRenderer.updateScore(passedLevel, passedLevel);
        } else {

            this.boardRenderer.showMessage("ИГРА ОКОНЧЕНА! Твой счёт: " + passedLevel + " Рекорд: " + bestScore);

            this.boardRenderer.updateScore(passedLevel, bestScore);
        }
    }

    resetGame() {
        this.isGameActive = false;
        this.isPlayerTurn = false;
        this.currentLevel = 0;
        this.sequence = [];
        this.playerStep = 0;

        this.boardRenderer.updateScore(this.currentLevel, this.storageManager.getBestScore());
        this.boardRenderer.createButtons();

        this.boardRenderer.showMessage('Нажми СТАРТ');
    }
}

class SequenceGenerator {
    constructor(totalButtons) {
        this.totalElements = totalButtons;
    }

    generateSequence(oldSequence = []) {
        const newStep = Math.floor(Math.random() * this.totalElements);
        const newSequence = oldSequence.slice();
        newSequence.push(newStep);
        return newSequence;
    }
}

class BoardRenderer {
    constructor(boardElement, onButtonClick, totalButtons) {
        this.boardElement = boardElement;
        this.onButtonClick = onButtonClick;
        this.totalButtons = totalButtons;
        this.buttons = [];
        this.canClick = false;
    }

    createButtons() {
        this.boardElement.innerHTML = '';
        this.buttons = [];

        for (let i = 0; i < this.totalButtons; i++) {
            const btn = document.createElement('button');

            btn.classList.add('simon-btn', BUTTON_COLORS[i % BUTTON_COLORS.length]);

            btn.addEventListener('click', () => {
                if (this.canClick) {
                    this.onButtonClick(i);
                }
            });

            this.boardElement.appendChild(btn);
            this.buttons.push(btn);
        }

        this.disableClick();
    }

    updateScore(level, bestScore) {
        const levelSpan = document.querySelector('#currentLevelDisplay');
        const bestSpan = document.querySelector('#bestScoreDisplay');
        if (levelSpan) levelSpan.textContent = level;
        if (bestSpan) bestSpan.textContent = bestScore;
    }

    disableClick() {
        this.canClick = false;
        this.buttons.forEach(btn => btn.classList.add('disabled'));
    }

    enableClick() {
        this.canClick = true;
        this.buttons.forEach(btn => btn.classList.remove('disabled'));
    }

    async highlightElement(buttonId, duration = 300) {
        if (buttonId >= this.totalButtons) return;

        this.buttons[buttonId].classList.add('active');

        await this.delay(duration);

        this.buttons[buttonId].classList.remove('active');
    }

    delay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    showMessage(message) {
        const messageDiv = document.getElementById('statusMessage');
        if (messageDiv) messageDiv.textContent = message;
    }
}

class StorageManager {
    static getBestScore() {
        const saved = localStorage.getItem('simonBestScore');
        return saved ? parseInt(saved, 10) : 0;
    }

    static saveBestScore(score) {
        if (score > this.getBestScore()) {
            localStorage.setItem('simonBestScore', score);
            return true;
        }
        return false;
    }
}

new Game();