import React from "react"

export default class Todo extends React.Component {
    render() {
        const {todo, onDone, onDel} = this.props;

        return (<div>
            <input
                type="checkbox"
                checked={todo.done}
                onChange={() => onDone(todo.id)}
            />
            <span>
                {todo.text}
              </span>

            <button onClick={() => onDel(todo.id)}>del</button>

        </div>);
    }
}