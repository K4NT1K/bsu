import React from 'react';

class App extends React.Component {
    state = {
        todos: [{id: 1, text: "Learn React", done: false}, {id: 2, text: "Build a Todo App", done: false}, {
            id: 3, text: "Help", done: false
        },], text: ""
    };

    handleNewText = (e) => {
        this.setState({text: e.target.value});
    };

    handleAddTodo = () => {
        if (!this.state.text) return;

        const newToDo = {
            id: Date.now(), text: this.state.text, done: false
        };

        this.setState({
            todos: [newToDo, ...this.state.todos], text: ""
        });
    };

    handleToDoDone = (id) => {
        const updatedTodos = this.state.todos.map((t) => t.id === id ? {...t, done: !t.done} : t);

        this.setState({todos: updatedTodos});
    };

    handleDelTodo = (id) => {
        const filteredTodos = this.state.todos.filter((t) => t.id !== id);
        this.setState({todos: filteredTodos});
    };

    generateTodo(n = 10) {
        Array.from({length: n}.fill())
    }

    render() {
        return (<div>
            <h1>MMF TODOLIST</h1>

            <input
                type="text"
                value={this.state.text}
                onChange={this.handleNewText}
            />

            <button onClick={this.handleAddTodo}>add</button>

            <div>
                {this.state.todos.map((t) => (<div key={t.id}>
                    <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => this.handleToDoDone(t.id)}
                    />
                    <span>
                            {t.text}
                        </span>

                    <button onClick={() => this.handleDelTodo(t.id)}>
                        delete
                    </button>
                </div>))}
            </div>
        </div>);
    }
}

export default App;