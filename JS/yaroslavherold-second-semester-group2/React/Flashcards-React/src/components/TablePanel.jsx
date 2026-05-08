import React from 'react';
import './TablePanel.css';
import './CardsTable.css';

export class TablePanel extends React.Component {
    render() {
        const { cards, isTableHidden, onHideToggle, onEdit, onDelete, onToggleLearned } =
            this.props;

        return (
            <aside className="table-panel">
                <div className="table-panel-header">
                    <span>Cards in deck</span>
                    <button id="hide" onClick={onHideToggle}>
                        {isTableHidden ? 'Show' : 'Hide'}
                    </button>
                </div>
                {!isTableHidden && (
                    <table id="cards">
                        <tbody>
                            {cards.map((card) => (
                                <tr key={card.id} className={card.isLearned ? 'learned' : ''}>
                                    <td>{card.front}</td>
                                    <td>{card.back}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={card.isLearned}
                                            onChange={() =>
                                                onToggleLearned(card.id, !card.isLearned)
                                            }
                                        />
                                        <button onClick={() => onEdit(card.id)}>Edit</button>
                                        <button
                                            className="deck-delete-btn"
                                            onClick={() => onDelete(card.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </aside>
        );
    }
}
