import { useState, useEffect } from 'react';

export const useStateManager = (storageManager) => {
    const [decks, setDecks] = useState([]);
    const [currentDeckId, setCurrentDeckId] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isTableHidden, setIsTableHidden] = useState(false);
    const [studyModeValue, setStudyModeValue] = useState('all');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const data = storageManager.load();

        if (data) {
            setDecks(Array.isArray(data.decks) ? data.decks : []);
            setCurrentDeckId(data.currentDeckId ?? null);
            setCurrentIndex(Number.isInteger(data.currentIndex) ? data.currentIndex : 0);
            setIsFlipped(Boolean(data.isFlipped));
            setIsTableHidden(Boolean(data.isTableHidden));
            setStudyModeValue(data.studyModeValue === 'unlearned' ? 'unlearned' : 'all');
        }

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        if (decks.length === 0) {
            const defaultDeck = {
                id: Date.now(),
                name: 'Main deck',
                cards: []
            };
            setDecks([defaultDeck]);
            setCurrentDeckId(defaultDeck.id);
        } else {
            const currentDeckExists = decks.some(deck => deck.id === currentDeckId);
            if (!currentDeckExists) {
                setCurrentDeckId(decks[0].id);
            }
        }
    }, [decks, currentDeckId, isLoaded]);

    const save = () => {
        storageManager.save({
            decks,
            currentDeckId,
            currentIndex,
            isFlipped,
            isTableHidden,
            studyModeValue
        });
    };

    useEffect(() => {
        if (isLoaded) {
            save();
        }
    }, [decks, currentDeckId, currentIndex, isFlipped, isTableHidden, studyModeValue, isLoaded]);

    const getActiveDeck = () => {
        return decks.find(deck => deck.id === currentDeckId) || null;
    };

    const getActiveCards = () => {
        const deck = getActiveDeck();
        return deck ? deck.cards : [];
    };

    const getStudyCards = () => {
        const cards = getActiveCards();

        if (studyModeValue === 'unlearned') {
            return cards.filter(card => !card.isLearned);
        }

        return cards;
    };

    const getCurrentStudyCard = () => {
        const studyCards = getStudyCards();

        if (studyCards.length === 0) {
            return null;
        }

        let index = currentIndex;
        if (index < 0 || index >= studyCards.length) {
            index = 0;
            setCurrentIndex(0);
        }

        return studyCards[index];
    };

    const addDeck = (name) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        const deck = {
            id: Date.now(),
            name: trimmedName,
            cards: []
        };

        const newDecks = [...decks, deck];
        setDecks(newDecks);
        setCurrentDeckId(deck.id);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const switchDeck = (deckId) => {
        if (currentDeckId === deckId) {
            return;
        }

        setCurrentDeckId(deckId);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const deleteDeck = (deckId) => {
        if (decks.length === 1) {
            return;
        }

        const newDecks = decks.filter(deck => deck.id !== deckId);
        setDecks(newDecks);

        if (currentDeckId === deckId) {
            setCurrentDeckId(newDecks[0].id);
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    const addCard = (front, back) => {
        const deck = getActiveDeck();

        if (!deck) {
            return;
        }

        const trimmedFront = front.trim();
        const trimmedBack = back.trim();

        if (!trimmedFront || !trimmedBack) {
            return;
        }

        const newDecks = decks.map(d => {
            if (d.id === deck.id) {
                return {
                    ...d,
                    cards: [...d.cards, {
                        id: Date.now(),
                        front: trimmedFront,
                        back: trimmedBack,
                        isLearned: false
                    }]
                };
            }
            return d;
        });
        setDecks(newDecks);
    };

    const deleteCard = (cardId) => {
        const deck = getActiveDeck();

        if (!deck) {
            return;
        }

        const newDecks = decks.map(d => {
            if (d.id === deck.id) {
                const updatedCards = d.cards.filter(card => card.id !== cardId);
                return { ...d, cards: updatedCards };
            }
            return d;
        });

        setDecks(newDecks);

        // Get updated study cards
        const updatedActiveDeck = newDecks.find(d => d.id === currentDeckId);
        let updatedStudyCards = updatedActiveDeck ? updatedActiveDeck.cards : [];
        if (studyModeValue === 'unlearned') {
            updatedStudyCards = updatedStudyCards.filter(card => !card.isLearned);
        }

        if (currentIndex >= updatedStudyCards.length) {
            setCurrentIndex(Math.max(0, updatedStudyCards.length - 1));
        }
    };

    const editCard = (cardId) => {
        const deck = getActiveDeck();

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

        deleteCard(cardId);
        return data;
    };

    const setCardLearned = (cardId, isLearned) => {
        const newDecks = decks.map(d => {
            if (d.id === currentDeckId) {
                return {
                    ...d,
                    cards: d.cards.map(card =>
                        card.id === cardId ? { ...card, isLearned } : card
                    )
                };
            }
            return d;
        });

        setDecks(newDecks);

        // Get updated study cards
        let updatedStudyCards = newDecks.find(d => d.id === currentDeckId)?.cards || [];
        if (studyModeValue === 'unlearned') {
            updatedStudyCards = updatedStudyCards.filter(card => !card.isLearned);
        }

        if (currentIndex >= updatedStudyCards.length) {
            setCurrentIndex(Math.max(0, updatedStudyCards.length - 1));
        }
    };

    const setCurrentCardLearned = (isLearned) => {
        const card = getCurrentStudyCard();

        if (!card) {
            return;
        }

        setCardLearned(card.id, isLearned);
    };

    const nextCard = () => {
        const studyCards = getStudyCards();

        if (studyCards.length === 0) {
            return;
        }

        setCurrentIndex((currentIndex + 1) % studyCards.length);
        setIsFlipped(false);
    };

    const previousCard = () => {
        const studyCards = getStudyCards();

        if (studyCards.length === 0) {
            return;
        }

        setCurrentIndex((currentIndex - 1 + studyCards.length) % studyCards.length);
        setIsFlipped(false);
    };

    const flipCard = () => {
        if (!getCurrentStudyCard()) {
            return;
        }

        setIsFlipped(!isFlipped);
    };

    const shuffleCards = () => {
        const deck = getActiveDeck();

        if (!deck || deck.cards.length < 2) {
            return;
        }

        const shuffledCards = [...deck.cards];
        for (let i = shuffledCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
        }

        const newDecks = decks.map(d => {
            if (d.id === deck.id) {
                return { ...d, cards: shuffledCards };
            }
            return d;
        });

        setDecks(newDecks);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const setStudyMode = (value) => {
        const mode = value === 'unlearned' ? 'unlearned' : 'all';
        setStudyModeValue(mode);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const toggleTableHidden = () => {
        setIsTableHidden(!isTableHidden);
    };

    return {
        decks,
        currentDeckId,
        currentIndex,
        isFlipped,
        isTableHidden,
        studyModeValue,
        getActiveDeck,
        getActiveCards,
        getStudyCards,
        getCurrentStudyCard,
        addDeck,
        switchDeck,
        deleteDeck,
        addCard,
        deleteCard,
        editCard,
        setCardLearned,
        setCurrentCardLearned,
        nextCard,
        previousCard,
        flipCard,
        shuffleCards,
        setStudyMode,
        toggleTableHidden
    };
};

