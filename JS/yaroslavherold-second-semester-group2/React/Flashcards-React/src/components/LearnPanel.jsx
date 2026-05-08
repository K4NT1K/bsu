import './LearnPanel.css';
import './CardDisplay.css';

export function LearnPanel({
    currentCard,
    isFlipped,
    studyModeValue,
    onStudyModeChange,
    onShuffle,
    onFlip,
    onPrevious,
    onNext,
    onCurrentLearned,
    onEditCurrent,
    onDeleteCurrent
}) {
    return (
        <div id="learn" className="learn-panel">
            <div className="study-toolbar">
                <div className="mode-switch">
                    <input
                        type="radio"
                        name="studyMode"
                        id="modeAll"
                        value="all"
                        checked={studyModeValue === 'all'}
                        onChange={(e) => onStudyModeChange(e.target.value)}
                    />
                    <label htmlFor="modeAll">All</label>
                    <input
                        type="radio"
                        name="studyMode"
                        id="modeUnlearned"
                        value="unlearned"
                        checked={studyModeValue === 'unlearned'}
                        onChange={(e) => onStudyModeChange(e.target.value)}
                    />
                    <label htmlFor="modeUnlearned">Unlearned</label>
                </div>
                <button id="shuffle" onClick={onShuffle}>
                    Shuffle
                </button>
            </div>

            <div id="cardContainer" className="card-container">
                {!currentCard ? (
                    <div className="card-display">There are no cards to study</div>
                ) : (
                    <>
                        <div
                            className={`card-display ${currentCard.isLearned ? 'learned' : ''}`}
                            onClick={onFlip}
                        >
                            {isFlipped ? currentCard.back : currentCard.front}
                        </div>
                    </>
                )}
            </div>

            {currentCard && (
                <>
                    <div className="current-card-actions">
                        <label className="learn-toggle">
                            <input
                                type="checkbox"
                                id="currentLearned"
                                checked={currentCard.isLearned}
                                onChange={(e) => onCurrentLearned(e.target.checked)}
                            />
                            <span>Learned</span>
                        </label>
                        <button id="editCurrent" onClick={onEditCurrent}>
                            Edit
                        </button>
                        <button id="deleteCurrent" onClick={onDeleteCurrent}>
                            Delete
                        </button>
                    </div>

                    <div className="card-nav">
                        <button id="previous" onClick={onPrevious}>
                            🢀
                        </button>
                        <button id="flip" onClick={onFlip}>
                            ⭯
                        </button>
                        <button id="next" onClick={onNext}>
                            🢂
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

