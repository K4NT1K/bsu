import './CardDisplay.css';

export function CardDisplay({
    card,
    isFlipped,
    onFlip,
    onLearned,
    onEdit,
    onDelete
}) {
    if (!card) {
        return <div className="card-display">There are no cards to study</div>;
    }

    return (
        <div className="card-display-wrapper">
            <div
                className={`card-display ${card.isLearned ? 'learned' : ''}`}
                onClick={onFlip}
            >
                {isFlipped ? card.back : card.front}
            </div>
            <div className="current-card-actions">
                <label className="learn-toggle">
                    <input
                        type="checkbox"
                        id="currentLearned"
                        checked={card.isLearned}
                        onChange={(e) => onLearned(e.target.checked)}
                    />
                    <span>Learned</span>
                </label>
                <button id="editCurrent" onClick={onEdit}>
                    Edit
                </button>
                <button id="deleteCurrent" onClick={onDelete}>
                    Delete
                </button>
            </div>
            <div className="card-nav">
                <button id="previous" onClick={onEdit} className="nav-btn">
                    Previous
                </button>
                <button id="flip" onClick={onFlip} className="nav-btn">
                    ⭯
                </button>
                <button id="next" onClick={onDelete} className="nav-btn">
                    Next
                </button>
            </div>
        </div>
    );
}

