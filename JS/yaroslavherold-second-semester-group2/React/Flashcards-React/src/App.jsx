import React from 'react'
import './App.css'
import { CreateForm } from './components/CreateForm'
import { DeckPanel } from './components/DeckPanel'
import { LearnPanel } from './components/LearnPanel'
import { TablePanel } from './components/TablePanel'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.storageKey = 'flashcards_data'
    this.state = {
      decks: [],
      currentDeckId: null,
      currentIndex: 0,
      isFlipped: false,
      isTableHidden: false,
      studyModeValue: 'all',
      questionValue: '',
      answerValue: '',
      deckNameValue: '',
      isLoaded: false
    }
  }

  componentDidMount() {
    const data = this.loadFromStorage()

    if (data) {
      this.setState(
        {
          decks: Array.isArray(data.decks) ? data.decks : [],
          currentDeckId: data.currentDeckId ?? null,
          currentIndex: Number.isInteger(data.currentIndex) ? data.currentIndex : 0,
          isFlipped: Boolean(data.isFlipped),
          isTableHidden: Boolean(data.isTableHidden),
          studyModeValue: data.studyModeValue === 'unlearned' ? 'unlearned' : 'all',
          isLoaded: true
        },
        this.ensureDefaultDeck
      )
      return
    }

    this.setState({ isLoaded: true }, this.ensureDefaultDeck)
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isLoaded) {
      return
    }

    const shouldSave =
      prevState.decks !== this.state.decks ||
      prevState.currentDeckId !== this.state.currentDeckId ||
      prevState.currentIndex !== this.state.currentIndex ||
      prevState.isFlipped !== this.state.isFlipped ||
      prevState.isTableHidden !== this.state.isTableHidden ||
      prevState.studyModeValue !== this.state.studyModeValue

    if (shouldSave) {
      this.saveToStorage()
    }
  }

  loadFromStorage() {
    const value = localStorage.getItem(this.storageKey)
    if (value === null) {
      return null
    }

    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  saveToStorage() {
    const { decks, currentDeckId, currentIndex, isFlipped, isTableHidden, studyModeValue } =
      this.state

    localStorage.setItem(
      this.storageKey,
      JSON.stringify({
        decks,
        currentDeckId,
        currentIndex,
        isFlipped,
        isTableHidden,
        studyModeValue
      })
    )
  }

  ensureDefaultDeck = () => {
    this.setState((prevState) => {
      if (prevState.decks.length === 0) {
        const defaultDeck = {
          id: Date.now(),
          name: 'Main deck',
          cards: []
        }

        return {
          decks: [defaultDeck],
          currentDeckId: defaultDeck.id,
          currentIndex: 0,
          isFlipped: false
        }
      }

      const currentDeckExists = prevState.decks.some(
        (deck) => deck.id === prevState.currentDeckId
      )

      if (!currentDeckExists) {
        return {
          currentDeckId: prevState.decks[0].id,
          currentIndex: 0,
          isFlipped: false
        }
      }

      return null
    })
  }

  getActiveDeck = () => {
    const { decks, currentDeckId } = this.state
    return decks.find((deck) => deck.id === currentDeckId) || null
  }

  getActiveCards = () => {
    const deck = this.getActiveDeck()
    return deck ? deck.cards : []
  }

  getStudyCardsFromDeck = (deck, studyModeValue) => {
    if (!deck) {
      return []
    }

    const cards = deck.cards || []
    if (studyModeValue === 'unlearned') {
      return cards.filter((card) => !card.isLearned)
    }

    return cards
  }

  getStudyCards = () => {
    const { studyModeValue } = this.state
    return this.getStudyCardsFromDeck(this.getActiveDeck(), studyModeValue)
  }

  getCurrentStudyCard = () => {
    const { currentIndex } = this.state
    const studyCards = this.getStudyCards()

    if (studyCards.length === 0) {
      return null
    }

    if (currentIndex < 0 || currentIndex >= studyCards.length) {
      return studyCards[0]
    }

    return studyCards[currentIndex]
  }

  addDeck = (name) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    const deck = {
      id: Date.now(),
      name: trimmedName,
      cards: []
    }

    this.setState((prevState) => ({
      decks: [...prevState.decks, deck],
      currentDeckId: deck.id,
      currentIndex: 0,
      isFlipped: false
    }))
  }

  switchDeck = (deckId) => {
    if (this.state.currentDeckId === deckId) {
      return
    }

    this.setState({ currentDeckId: deckId, currentIndex: 0, isFlipped: false })
  }

  deleteDeck = (deckId) => {
    this.setState((prevState) => {
      if (prevState.decks.length === 1) {
        return null
      }

      const newDecks = prevState.decks.filter((deck) => deck.id !== deckId)
      if (prevState.currentDeckId === deckId) {
        return {
          decks: newDecks,
          currentDeckId: newDecks[0].id,
          currentIndex: 0,
          isFlipped: false
        }
      }

      return { decks: newDecks }
    })
  }

  addCard = (front, back) => {
    const trimmedFront = front.trim()
    const trimmedBack = back.trim()

    if (!trimmedFront || !trimmedBack) {
      return
    }

    this.setState((prevState) => {
      const deck = prevState.decks.find((d) => d.id === prevState.currentDeckId)
      if (!deck) {
        return null
      }

      const newDecks = prevState.decks.map((d) => {
        if (d.id === deck.id) {
          return {
            ...d,
            cards: [
              ...d.cards,
              {
                id: Date.now(),
                front: trimmedFront,
                back: trimmedBack,
                isLearned: false
              }
            ]
          }
        }
        return d
      })

      return { decks: newDecks }
    })
  }

  deleteCard = (cardId) => {
    this.setState((prevState) => {
      const deck = prevState.decks.find((d) => d.id === prevState.currentDeckId)
      if (!deck) {
        return null
      }

      const updatedDeck = {
        ...deck,
        cards: deck.cards.filter((card) => card.id !== cardId)
      }

      const newDecks = prevState.decks.map((d) => (d.id === deck.id ? updatedDeck : d))
      const updatedStudyCards = this.getStudyCardsFromDeck(
        updatedDeck,
        prevState.studyModeValue
      )

      const nextIndex = Math.min(
        prevState.currentIndex,
        Math.max(0, updatedStudyCards.length - 1)
      )

      return { decks: newDecks, currentIndex: nextIndex }
    })
  }

  editCard = (cardId) => {
    const deck = this.getActiveDeck()
    if (!deck) {
      return null
    }

    const card = deck.cards.find((item) => item.id === cardId)
    if (!card) {
      return null
    }

    const data = { front: card.front, back: card.back }
    this.deleteCard(cardId)
    return data
  }

  setCardLearned = (cardId, isLearned) => {
    this.setState((prevState) => {
      const newDecks = prevState.decks.map((deck) => {
        if (deck.id === prevState.currentDeckId) {
          return {
            ...deck,
            cards: deck.cards.map((card) =>
              card.id === cardId ? { ...card, isLearned } : card
            )
          }
        }
        return deck
      })

      const updatedDeck = newDecks.find((deck) => deck.id === prevState.currentDeckId)
      const updatedStudyCards = this.getStudyCardsFromDeck(
        updatedDeck,
        prevState.studyModeValue
      )
      const nextIndex = Math.min(
        prevState.currentIndex,
        Math.max(0, updatedStudyCards.length - 1)
      )

      return { decks: newDecks, currentIndex: nextIndex }
    })
  }

  setCurrentCardLearned = (isLearned) => {
    const currentCard = this.getCurrentStudyCard()
    if (!currentCard) {
      return
    }

    this.setCardLearned(currentCard.id, isLearned)
  }

  nextCard = () => {
    const studyCards = this.getStudyCards()
    if (studyCards.length === 0) {
      return
    }

    this.setState((prevState) => ({
      currentIndex: (prevState.currentIndex + 1) % studyCards.length,
      isFlipped: false
    }))
  }

  previousCard = () => {
    const studyCards = this.getStudyCards()
    if (studyCards.length === 0) {
      return
    }

    this.setState((prevState) => ({
      currentIndex: (prevState.currentIndex - 1 + studyCards.length) % studyCards.length,
      isFlipped: false
    }))
  }

  flipCard = () => {
    if (!this.getCurrentStudyCard()) {
      return
    }

    this.setState((prevState) => ({ isFlipped: !prevState.isFlipped }))
  }

  shuffleCards = () => {
    this.setState((prevState) => {
      const deck = prevState.decks.find((d) => d.id === prevState.currentDeckId)
      if (!deck || deck.cards.length < 2) {
        return null
      }

      const shuffledCards = [...deck.cards]
      for (let i = shuffledCards.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]]
      }

      const newDecks = prevState.decks.map((d) =>
        d.id === deck.id ? { ...d, cards: shuffledCards } : d
      )

      return { decks: newDecks, currentIndex: 0, isFlipped: false }
    })
  }

  setStudyMode = (value) => {
    const mode = value === 'unlearned' ? 'unlearned' : 'all'
    this.setState({ studyModeValue: mode, currentIndex: 0, isFlipped: false })
  }

  toggleTableHidden = () => {
    this.setState((prevState) => ({ isTableHidden: !prevState.isTableHidden }))
  }

  handleQuestionChange = (value) => {
    this.setState({ questionValue: value })
  }

  handleAnswerChange = (value) => {
    this.setState({ answerValue: value })
  }

  handleDeckNameChange = (value) => {
    this.setState({ deckNameValue: value })
  }

  handleCreateCard = () => {
    this.addCard(this.state.questionValue, this.state.answerValue)
    this.setState({ questionValue: '', answerValue: '' })
  }

  handleAddDeck = () => {
    this.addDeck(this.state.deckNameValue)
    this.setState({ deckNameValue: '' })
  }

  handleEditCard = (cardId) => {
    const edited = this.editCard(cardId)
    if (edited) {
      this.setState({ questionValue: edited.front, answerValue: edited.back })
    }
  }

  handleEditCurrentCard = () => {
    const currentCard = this.getCurrentStudyCard()
    if (currentCard) {
      this.handleEditCard(currentCard.id)
    }
  }

  handleDeleteCurrentCard = () => {
    const currentCard = this.getCurrentStudyCard()
    if (currentCard) {
      this.deleteCard(currentCard.id)
    }
  }

  render() {
    const {
      questionValue,
      answerValue,
      deckNameValue,
      decks,
      currentDeckId,
      isFlipped,
      studyModeValue,
      isTableHidden
    } = this.state

    return (
      <>
        <h1>Flashcards</h1>

        <section className="top-panel">
          <CreateForm
            questionValue={questionValue}
            answerValue={answerValue}
            onQuestionChange={this.handleQuestionChange}
            onAnswerChange={this.handleAnswerChange}
            onCreateCard={this.handleCreateCard}
          />

          <DeckPanel
            decks={decks}
            currentDeckId={currentDeckId}
            deckNameValue={deckNameValue}
            onDeckNameChange={this.handleDeckNameChange}
            onAddDeck={this.handleAddDeck}
            onSwitchDeck={this.switchDeck}
            onDeleteDeck={this.deleteDeck}
          />
        </section>

        <section className="workspace">
          <LearnPanel
            currentCard={this.getCurrentStudyCard()}
            isFlipped={isFlipped}
            studyModeValue={studyModeValue}
            onStudyModeChange={this.setStudyMode}
            onShuffle={this.shuffleCards}
            onFlip={this.flipCard}
            onPrevious={this.previousCard}
            onNext={this.nextCard}
            onCurrentLearned={this.setCurrentCardLearned}
            onEditCurrent={this.handleEditCurrentCard}
            onDeleteCurrent={this.handleDeleteCurrentCard}
          />

          <TablePanel
            cards={this.getActiveCards()}
            isTableHidden={isTableHidden}
            onHideToggle={this.toggleTableHidden}
            onEdit={this.handleEditCard}
            onDelete={this.deleteCard}
            onToggleLearned={this.setCardLearned}
          />
        </section>
      </>
    )
  }
}

export default App
