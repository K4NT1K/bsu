let todos = []

const addBtn = document.querySelector('#add')
const clearBtn = document.querySelector('#clear')
const input = document.querySelector('#inputText')
const todoList = document.querySelector('#todolist')

addBtn.addEventListener('click', handleAddTodo)
clearBtn.addEventListener('click', clearTodo)

function handleAddTodo() {
    const taskText = input.value

     if (taskText.trim() === '') {
        alert('Incorrect input!')
        return
    }

    let newTodo = {
         task: taskText,
         id: Date.now(),
         completed: false
     }
    todos.push(newTodo)

    input.value = ''

    renderTodo()
}

function renderTodo() {
    todoList.innerHTML = ''
    for (let i = 0; i < todos.length; i++) {
        const item = todos[i]
        const status = item.completed ? 'checked' : '';

        const li = document.createElement('li')
        li.innerHTML = `<input type="checkbox" ${status}>
            <span class="${status}">${todos[i].task}</span>`;
        li.querySelector('input').onclick = () => {
            todos = todos.map(todo =>
                todo.id === item.id ? { ...todo, completed: !todo.completed } : todo
            );
            renderTodo();
        };

        const deleteBtn = document.createElement('button')
        deleteBtn.innerText = 'Delete'
        deleteBtn.addEventListener('click', function() {
            todos = todos.filter(todo => todo.id !== item.id)
            renderTodo();
        })

        li.appendChild(deleteBtn)
        todoList.appendChild(li)
    }
}

function clearTodo() {
    todos = []
    document.getElementById('todolist').innerHTML = ''
}