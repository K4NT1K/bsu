import { useState } from 'react'
import './App.css'
import { useStorageManager } from './hooks/useStorageManager'
import { useStateManager } from './hooks/useStateManager'
import { CreateForm } from './components/CreateForm'
import { DeckPanel } from './components/DeckPanel'
import { LearnPanel } from './components/LearnPanel'
import { TablePanel } from './components/TablePanel'

function App() {
  const storageManager = useStorageManager('flashcards_data')
  const state = useStateManager(storageManager)

  const [questionValue, setQuestionValue] = useState('')
  const [answerValue, setAnswerValue] = useState('')
  const [deckNameValue, setDeckNameValue] = useState('')

  const handleCreateCard = () => {
    state.addCard(questionValue, answerValue)
    setQuestionValue('')
    setAnswerValue('')
  }

  const handleAddDeck = () => {
    state.addDeck(deckNameValue)
    setDeckNameValue('')
  }

  const handleEditCard = (cardId) => {
    const edited = state.editCard(cardId)
    if (edited) {
      setQuestionValue(edited.front)
      setAnswerValue(edited.back)
    }
  }

  const handleEditCurrentCard = () => {
    const currentCard = state.getCurrentStudyCard()
    if (currentCard) {
      handleEditCard(currentCard.id)
    }
  }

  const handleDeleteCurrentCard = () => {
    const currentCard = state.getCurrentStudyCard()
    if (currentCard) {
      state.deleteCard(currentCard.id)
    }
  }

  return (
    <>
      <h1>Flashcards</h1>

      <section className="top-panel">
        <CreateForm
          questionValue={questionValue}
          answerValue={answerValue}
          onQuestionChange={setQuestionValue}
          onAnswerChange={setAnswerValue}
          onCreateCard={handleCreateCard}
        />

        <DeckPanel
          decks={state.decks}
          currentDeckId={state.currentDeckId}
          deckNameValue={deckNameValue}
          onDeckNameChange={setDeckNameValue}
          onAddDeck={handleAddDeck}
          onSwitchDeck={state.switchDeck}
          onDeleteDeck={state.deleteDeck}
        />
      </section>

      <section className="workspace">
        <LearnPanel
          currentCard={state.getCurrentStudyCard()}
          isFlipped={state.isFlipped}
          studyModeValue={state.studyModeValue}
          onStudyModeChange={state.setStudyMode}
          onShuffle={state.shuffleCards}
          onFlip={state.flipCard}
          onPrevious={state.previousCard}
          onNext={state.nextCard}
          onCurrentLearned={state.setCurrentCardLearned}
          onEditCurrent={handleEditCurrentCard}
          onDeleteCurrent={handleDeleteCurrentCard}
        />

        <TablePanel
          cards={state.getActiveCards()}
          isTableHidden={state.isTableHidden}
          onHideToggle={state.toggleTableHidden}
          onEdit={handleEditCard}
          onDelete={state.deleteCard}
          onToggleLearned={state.setCardLearned}
        />
      </section>
    </>
  )
}

export default App
