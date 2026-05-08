import './CardsTable.css';

export function CardsTable({
    cards,
    isTableHidden,
    onEdit,
    onDelete,
    onToggleLearned
}) {
    if (isTableHidden) {
        return null;
    }

    return (
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
                                onChange={() => onToggleLearned(card.id, !card.isLearned)}
                            />
                            <button onClick={() => onEdit(card.id)}>Edit</button>
                            <button className="deck-delete-btn" onClick={() => onDelete(card.id)}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

