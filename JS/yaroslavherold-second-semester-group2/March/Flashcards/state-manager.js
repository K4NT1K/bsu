class StateManager {
    constructor(storageManager) {
        this.storageManager = storageManager;

        this.decks = [];
        this.currentDeckId = null;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.isTableHidden = false;
        this.studyModeValue = 'all';

        this.load();
        this.ensureDefaultDeck();
    }

    load() {
        const data = this.storageManager.load();

        if (!data) {
            return;
        }

        this.decks = Array.isArray(data.decks) ? data.decks : [];
        this.currentDeckId = data.currentDeckId ?? null;
        this.currentIndex = Number.isInteger(data.currentIndex) ? data.currentIndex : 0;
        this.isFlipped = Boolean(data.isFlipped);
        this.isTableHidden = Boolean(data.isTableHidden);
        this.studyModeValue = data.studyModeValue === 'unlearned' ? 'unlearned' : 'all';
    }

    save() {
        this.storageManager.save({
            decks: this.decks,
            currentDeckId: this.currentDeckId,
            currentIndex: this.currentIndex,
            isFlipped: this.isFlipped,
            isTableHidden: this.isTableHidden,
            studyModeValue: this.studyModeValue
        });
    }

    ensureDefaultDeck() {
        if (this.decks.length === 0) {
            const defaultDeck = {
                id: Date.now(),
                name: 'Main deck',
                cards: []
            };

            this.decks.push(defaultDeck);
            this.currentDeckId = defaultDeck.id;
            this.save();
            return;
        }

        const currentDeckExists = this.decks.some(deck => deck.id === this.currentDeckId);

        if (!currentDeckExists) {
            this.currentDeckId = this.decks[0].id;
        }
    }

    getActiveDeck() {
        return this.decks.find(deck => deck.id === this.currentDeckId) || null;
    }

    getActiveCards() {
        const deck = this.getActiveDeck();
        return deck ? deck.cards : [];
    }

    getStudyCards() {
        const cards = this.getActiveCards();

        if (this.studyModeValue === 'unlearned') {
            return cards.filter(card => !card.isLearned);
        }

        return cards;
    }

    getCurrentStudyCard() {
        const studyCards = this.getStudyCards();

        if (studyCards.length === 0) {
            return null;
        }

        if (this.currentIndex < 0 || this.currentIndex >= studyCards.length) {
            this.currentIndex = 0;
        }

        return studyCards[this.currentIndex];
    }

    addDeck(name) {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        const deck = {
            id: Date.now(),
            name: trimmedName,
            cards: []
        };

        this.decks.push(deck);
        this.currentDeckId = deck.id;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.save();
    }

    switchDeck(deckId) {
        if (this.currentDeckId === deckId) {
            return;
        }

        this.currentDeckId = deckId;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.save();
    }

    deleteDeck(deckId) {
        if (this.decks.length === 1) {
            return;
        }

        this.decks = this.decks.filter(deck => deck.id !== deckId);

        if (this.currentDeckId === deckId) {
            this.currentDeckId = this.decks[0].id;
            this.currentIndex = 0;
            this.isFlipped = false;
        }

        this.save();
    }

    addCard(front, back) {
        const deck = this.getActiveDeck();

        if (!deck) {
            return;
        }

        const trimmedFront = front.trim();
        const trimmedBack = back.trim();

        if (!trimmedFront || !trimmedBack) {
            return;
        }

        deck.cards.push({
            id: Date.now(),
            front: trimmedFront,
            back: trimmedBack,
            isLearned: false
        });

        this.save();
    }

    deleteCard(cardId) {
        const deck = this.getActiveDeck();

        if (!deck) {
            return;
        }

        deck.cards = deck.cards.filter(card => card.id !== cardId);

        const studyCards = this.getStudyCards();

        if (this.currentIndex >= studyCards.length) {
            this.currentIndex = Math.max(0, studyCards.length - 1);
        }

        if (deck.cards.length === 0) {
            this.currentIndex = 0;
        }

        this.save();
    }

    editCard(cardId) {
        const deck = this.getActiveDeck();

        if (!deck) {
            return null;
        }

        const card = deck.cards.find(card => card.id === cardId);

        if (!card) {
            return null;
        }

        const data = {
            front: card.front,
            back: card.back
        };

        this.deleteCard(cardId);
        return data;
    }

    setCardLearned(cardId, isLearned) {
        const deck = this.getActiveDeck();

        if (!deck) {
            return;
        }

        const card = deck.cards.find(card => card.id === cardId);

        if (!card) {
            return;
        }

        card.isLearned = isLearned;

        const studyCards = this.getStudyCards();

        if (this.currentIndex >= studyCards.length) {
            this.currentIndex = Math.max(0, studyCards.length - 1);
        }

        this.save();
    }

    setCurrentCardLearned(isLearned) {
        const card = this.getCurrentStudyCard();

        if (!card) {
            return;
        }

        card.isLearned = isLearned;

        const studyCards = this.getStudyCards();

        if (this.currentIndex >= studyCards.length) {
            this.currentIndex = Math.max(0, studyCards.length - 1);
        }

        this.save();
    }

    nextCard() {
        const studyCards = this.getStudyCards();

        if (studyCards.length === 0) {
            return;
        }

        this.currentIndex = (this.currentIndex + 1) % studyCards.length;
        this.isFlipped = false;
        this.save();
    }

    previousCard() {
        const studyCards = this.getStudyCards();

        if (studyCards.length === 0) {
            return;
        }

        this.currentIndex = (this.currentIndex - 1 + studyCards.length) % studyCards.length;
        this.isFlipped = false;
        this.save();
    }

    flipCard() {
        if (!this.getCurrentStudyCard()) {
            return;
        }

        this.isFlipped = !this.isFlipped;
        this.save();
    }

    shuffleCards() {
        const deck = this.getActiveDeck();

        if (!deck || deck.cards.length < 2) {
            return;
        }

        for (let i = deck.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
        }

        this.currentIndex = 0;
        this.isFlipped = false;
        this.save();
    }

    setStudyMode(value) {
        this.studyModeValue = value === 'unlearned' ? 'unlearned' : 'all';
        this.currentIndex = 0;
        this.isFlipped = false;
        this.save();
    }

    toggleTableHidden() {
        this.isTableHidden = !this.isTableHidden;
        this.save();
    }
}