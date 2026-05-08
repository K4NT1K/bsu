import React from 'react';
import './DeckPanel.css';

export class DeckPanel extends React.Component {
    render() {
        const {
            decks,
            currentDeckId,
            deckNameValue,
            onDeckNameChange,
            onAddDeck,
            onSwitchDeck,
            onDeleteDeck
        } = this.props;

        return (
            <div className="deck-panel">
                <div className="deck-panel-header">Decks</div>
                <div className="deck-controls">
                    <input
                        type="text"
                        id="deckName"
                        placeholder="New deck name"
                        maxLength="40"
                        value={deckNameValue}
                        onChange={(e) => onDeckNameChange(e.target.value)}
                    />
                    <button id="createDeck" onClick={onAddDeck}>
                        Add deck
                    </button>
                </div>
                <div id="deckList" className="deck-list">
                    {decks.map((deck) => (
                        <div
                            key={deck.id}
                            className={`deck-item ${deck.id === currentDeckId ? 'active' : ''}`}
                        >
                            <span>{`${deck.name} (${deck.cards.length})`}</span>
                            <div className="deck-actions">
                                <button
                                    className="deck-open-btn"
                                    onClick={() => onSwitchDeck(deck.id)}
                                >
                                    Open
                                </button>
                                <button
                                    className="deck-delete-btn"
                                    disabled={decks.length === 1}
                                    onClick={() => onDeleteDeck(deck.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

