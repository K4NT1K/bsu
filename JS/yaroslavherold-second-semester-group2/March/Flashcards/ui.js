    class UI {
    constructor(state) {
        this.state = state;

        this.createBtn = document.getElementById('create');
        this.createDeckBtn = document.getElementById('createDeck');
        this.deckNameInput = document.getElementById('deckName');
        this.questionInput = document.getElementById('question');
        this.answerInput = document.getElementById('answer');
        this.table = document.getElementById('cards');
        this.cardContainer = document.getElementById('cardContainer');
        this.nextBtn = document.getElementById('next');
        this.previousBtn = document.getElementById('previous');
        this.flipBtn = document.getElementById('flip');
        this.hideBtn = document.getElementById('hide');
        this.deckList = document.getElementById('deckList');
        this.shuffleBtn = document.getElementById('shuffle');
        this.currentLearnedCheckbox = document.getElementById('currentLearned');
        this.editCurrentBtn = document.getElementById('editCurrent');
        this.deleteCurrentBtn = document.getElementById('deleteCurrent');
        this.studyModeInputs = document.querySelectorAll('input[name="studyMode"]');
    }

    bindEvents() {
        this.createBtn.addEventListener('click', () => {
            this.state.addCard(this.questionInput.value, this.answerInput.value);
            this.questionInput.value = '';
            this.answerInput.value = '';
            this.renderAll();
        });

        this.createDeckBtn.addEventListener('click', () => {
            this.state.addDeck(this.deckNameInput.value);
            this.deckNameInput.value = '';
            this.renderAll();
        });

        this.nextBtn.addEventListener('click', () => {
            this.state.nextCard();
            this.renderCard();
        });

        this.previousBtn.addEventListener('click', () => {
            this.state.previousCard();
            this.renderCard();
        });

        this.flipBtn.addEventListener('click', () => {
            this.state.flipCard();
            this.renderCard();
        });

        this.hideBtn.addEventListener('click', () => {
            this.state.toggleTableHidden();
            this.syncHiddenTableUI();
        });

        this.shuffleBtn.addEventListener('click', () => {
            this.state.shuffleCards();
            this.renderAll();
        });

        this.editCurrentBtn.addEventListener('click', () => {
            const currentCard = this.state.getCurrentStudyCard();

            if (!currentCard) {
                return;
            }

            const edited = this.state.editCard(currentCard.id);

            if (!edited) {
                return;
            }

            this.questionInput.value = edited.front;
            this.answerInput.value = edited.back;
            this.renderAll();
        });

        this.deleteCurrentBtn.addEventListener('click', () => {
            const currentCard = this.state.getCurrentStudyCard();

            if (!currentCard) {
                return;
            }

            this.state.deleteCard(currentCard.id);
            this.renderAll();
        });

        this.currentLearnedCheckbox.addEventListener('change', () => {
            this.state.setCurrentCardLearned(this.currentLearnedCheckbox.checked);
            this.renderAll();
        });

        this.studyModeInputs.forEach(input => {
            input.addEventListener('change', () => {
                const checked = document.querySelector('input[name="studyMode"]:checked');

                if (!checked) {
                    return;
                }

                this.state.setStudyMode(checked.value);
                this.renderCard();
            });
        });
    }

    renderAll() {
        this.syncStudyModeUI();
        this.syncHiddenTableUI();
        this.renderDeckList();
        this.renderTable();
        this.renderCard();
    }

    syncStudyModeUI() {
        this.studyModeInputs.forEach(input => {
            input.checked = input.value === this.state.studyModeValue;
        });
    }

    syncHiddenTableUI() {
        if (this.state.isTableHidden) {
            this.table.classList.add('hidden');
            this.hideBtn.value = 'Show';
        } else {
            this.table.classList.remove('hidden');
            this.hideBtn.value = 'Hide';
        }
    }

    renderDeckList() {
        this.deckList.innerHTML = '';

        for (const deck of this.state.decks) {
            const deckItem = document.createElement('div');
            deckItem.className = 'deck-item';

            if (deck.id === this.state.currentDeckId) {
                deckItem.classList.add('active');
            }

            const title = document.createElement('span');
            title.textContent = `${deck.name} (${deck.cards.length})`;

            const actions = document.createElement('div');
            actions.className = 'deck-actions';

            const openBtn = document.createElement('button');
            openBtn.textContent = 'Open';
            openBtn.className = 'deck-open-btn';
            openBtn.addEventListener('click', () => {
                this.state.switchDeck(deck.id);
                this.renderAll();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'deck-delete-btn';
            deleteBtn.disabled = this.state.decks.length === 1;
            deleteBtn.addEventListener('click', () => {
                this.state.deleteDeck(deck.id);
                this.renderAll();
            });

            actions.appendChild(openBtn);
            actions.appendChild(deleteBtn);

            deckItem.appendChild(title);
            deckItem.appendChild(actions);

            this.deckList.appendChild(deckItem);
        }
    }

    renderTable() {
        this.table.innerHTML = '';

        const cards = this.state.getActiveCards();

        for (const card of cards) {
            const row = document.createElement('tr');

            if (card.isLearned) {
                row.classList.add('learned');
            }

            const frontCell = document.createElement('td');
            frontCell.textContent = card.front;

            const backCell = document.createElement('td');
            backCell.textContent = card.back;

            const actionsCell = document.createElement('td');

            const learnCheckbox = document.createElement('input');
            learnCheckbox.type = 'checkbox';
            learnCheckbox.checked = card.isLearned;
            learnCheckbox.addEventListener('change', () => {
                this.state.setCardLearned(card.id, learnCheckbox.checked);
                this.renderAll();
            });

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                const edited = this.state.editCard(card.id);

                if (!edited) {
                    return;
                }

                this.questionInput.value = edited.front;
                this.answerInput.value = edited.back;
                this.renderAll();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'deck-delete-btn';
            deleteBtn.addEventListener('click', () => {
                this.state.deleteCard(card.id);
                this.renderAll();
            });

            actionsCell.appendChild(learnCheckbox);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);

            row.appendChild(frontCell);
            row.appendChild(backCell);
            row.appendChild(actionsCell);

            this.table.appendChild(row);
        }
    }

    renderCard() {
        this.cardContainer.innerHTML = '';

        const card = this.state.getCurrentStudyCard();

        if (!card) {
            this.cardContainer.innerHTML = 'There are no cards to study';
            this.currentLearnedCheckbox.checked = false;
            this.currentLearnedCheckbox.disabled = true;
            this.editCurrentBtn.disabled = true;
            this.deleteCurrentBtn.disabled = true;
            return;
        }

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-display';
        cardDiv.textContent = this.state.isFlipped ? card.back : card.front;

        if (card.isLearned) {
            cardDiv.classList.add('learned');
        }

        cardDiv.addEventListener('click', () => {
            this.state.flipCard();
            this.renderCard();
        });

        this.currentLearnedCheckbox.disabled = false;
        this.currentLearnedCheckbox.checked = card.isLearned;
        this.editCurrentBtn.disabled = false;
        this.deleteCurrentBtn.disabled = false;

        this.cardContainer.appendChild(cardDiv);
    }
}