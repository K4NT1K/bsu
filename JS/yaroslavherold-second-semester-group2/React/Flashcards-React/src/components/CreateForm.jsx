import React from 'react';
import './CreateForm.css';

export class CreateForm extends React.Component {
    render() {
        const { questionValue, answerValue, onQuestionChange, onAnswerChange, onCreateCard } =
            this.props;

        return (
            <form className="create-form">
                <textarea
                    id="question"
                    placeholder="Enter a question"
                    rows="3"
                    maxLength="200"
                    value={questionValue}
                    onChange={(e) => onQuestionChange(e.target.value)}
                ></textarea>
                <textarea
                    id="answer"
                    placeholder="Answer"
                    rows="3"
                    maxLength="200"
                    value={answerValue}
                    onChange={(e) => onAnswerChange(e.target.value)}
                ></textarea>
                <button type="button" id="create" onClick={onCreateCard}>
                    CREATE
                </button>
            </form>
        );
    }
}

