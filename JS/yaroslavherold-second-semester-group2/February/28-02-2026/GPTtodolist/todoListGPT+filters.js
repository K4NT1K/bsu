const store = createTodoStore();
store.add("Выучить JS замыкания", "high");
store.add("Покормить кота", "medium");
store.add("Купить молоко", "low",true);
// Глобальные настройки отображения (состояние UI)
let currentFilter = 'all';

// 1. Фабрики фильтров (тема: возврат функции)
const filters = {
    all: () => true,
    completed: (item) => item.completed,
    active: (item) => !item.completed
};

// 2. Стратегия сортировки (приоритеты)
const priorityWeight = { high: 3, medium: 2, low: 1 };
const sortByPriority = (a, b) => priorityWeight[b.priority] - priorityWeight[a.priority];

// 3. Основные элементы управления
const input = document.getElementById('todo-input');
const prioritySelect = document.getElementById('todo-priority');
const addBtn = document.getElementById('add-btn');
const listElement = document.getElementById('todo-list');
refresh();

function refresh() {
    const items = store.getItems(filters[currentFilter], sortByPriority);
    render(listElement, items, store);
}

addBtn.addEventListener('click', () => {
    if (input.value.trim()) {
        store.add(input.value, prioritySelect.value);
        input.value = '';
        refresh();
    }
});

// Функция переключения фильтра
function setFilter(type) {
    currentFilter = type;
    refresh();
};


////////////////////////////////////////////////////////////////////////////////////
function createTodoStore() {
  let todos = []; 

  return ({
    add: (text, priority="medium", completed=false) => {
      const newTodo = { id: crypto.randomUUID(), text, priority, completed };//Современный стандарт, уникальный ID
      todos.push(newTodo);
    },
    remove: (id) => {
      todos = todos.filter(t => t.id !== id);
    },
    toggle: (id) => {
      todos = todos.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      );
    },
//    getItems: () => [...todos] //(здесь задел под фильтры и сортировки)
getItems: (filterFn = () => true, sortFn = () => 0) => {return [...todos].filter(filterFn).sort(sortFn);}    
  });
}
////////////////////////////////////////////////////////////////////////////
function render(container, items, store) {
  container.innerHTML = ''; // Очистка

  items.forEach(todo => {
    const li = document.createElement('li');
    //li.dataset.id = todo.id; // если хотим показать потом делегирование событий, то сохранияем id в DOM
    li.classList.toggle('completed', todo.completed);// UI в CSS, не в JS
    // лучше делать createElement('input'), createElement('span')...
    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? 'checked' : ''}>
      <span style="font-weight: ${todo.priority === 'high' ? 'bold' : 'normal'}">
        [${todo.priority}] ${todo.text.replace(/</g, ' ')}
      </span>
      <button class="del-btn">Удалить</button>
    `;

    li.querySelector('input').addEventListener('click', () => {
      store.toggle(todo.id); 
      refresh(); 
    });

    li.querySelector('.del-btn').addEventListener('click', () => {
      store.remove(todo.id);
      refresh(); 
    });

    container.appendChild(li);
  });
  /*Делегирование событий*/
  /*container.addEventListener('click', (event) => { const li = event.target.closest('li'); if (!li) return; const id = Number(li.dataset.id); if (event.target.classList.contains('todo-check')) { store.toggle(id); refresh(); // Перерисовываем } if (event.target.classList.contains('del-btn')) { store.remove(id); refresh(); // Перерисовываем } }, { once: true });*/
}

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

/* добавление в архитектуру технологии "подписок"*/
/*
//Сейчас вручную вызываем refresh() после каждого действия.
//Лучше сделать store с механизмом подписки:
store.subscribe(refresh); //Подписка на изменения состояния. не придётся вызывать refresh() вручную

function createTodoStore() {
  let todos = [];
  let listeners = [];

  function notify() {
    listeners.forEach(l => l());
  }

  return {
    subscribe: (listener) => {
      listeners.push(listener);
    },

    add: (text, priority = "medium") => {
      todos.push({        id: crypto.randomUUID(),        text,        priority,       completed: false
      });
      notify();
    },

    remove: (id) => {
      todos = todos.filter(t => t.id !== id);
      notify();
    },

    toggle: (id) => {
      todos = todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      notify();
    },

    getItems: () => [...todos]
  };
}
*/
/*
в чем разница сейчас? было в каждом действии refresh теперь notify
На первый взгляд кажется, что разницы нет:

было → refresh()
стало → notify() → refresh()

Но разница архитектурная, а не синтаксическая.

🔴 Как было (tight coupling)

Раньше UI управлял обновлением:
store.add(...)
refresh()

То есть:
UI знает, что после изменения нужно перерисовывать
UI отвечает за согласованность состояния
Если забудешь вызвать refresh() — будет баг
Если появится второй источник изменений — всё сломается

Это называется жёсткая связка (tight coupling):
UI зависит от внутренних изменений store.

🟢 Как стало (reactive model)

Теперь:

store.add(...)

Store сам делает:
notify()
А UI просто подписан:
store.subscribe(refresh)

Теперь:
UI не управляет обновлением
Store сам сообщает: "я изменился"
UI просто реагирует
Невозможно забыть обновление

Это уже наблюдатель (Observer pattern).

⚡ Главное отличие
Раньше поток управления был такой:
UI → Store → UI
UI контролирует всё.

Теперь поток такой:
UI → Store
Store → подписчики

Store становится центром правды (single source of truth).

🔥 Почему это важно в реальном приложении

Представь, что:

1️⃣ Добавился auto-save
store.subscribe(saveToLocalStorage)
2️⃣ Добавилась аналитика
store.subscribe(logChanges)
3️⃣ Добавился второй UI (например, счетчик задач)
store.subscribe(updateCounter)

В старой модели тебе пришлось бы везде вручную вызывать:

refresh()
save()
log()
updateCounter()

В новой — это происходит автоматически.

🎯 Ключевая разница
Было    Стало
UI контролирует обновление  Store сообщает об изменениях
Можно забыть refresh    Нельзя забыть
Один слушатель  Сколько угодно
Жёсткая связка  Слабая связка
🧠 Самое главное

Ты перешёл от:
"После действия нужно обновить UI"

к
"Когда состояние меняется — все подписчики узнают"
Это и есть переход к реактивной архитектуре.*/

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

/* Инверсию зависимостей (IoC) на твоём todo‑примере можно показать очень наглядно, потому что у тебя уже есть три чёткие роли:

Store — источник данных и бизнес‑логика.

UI — рендер и обработчики событий.

Контроллер — refresh(), фильтры, сортировки.

DI (внедрение зависимостей) — это как зависимости попадают в код.
IoC (инверсия управления) — это кто управляет тем, что с чем работает.

Ниже — структурное объяснение, как показать студентам IoC именно на твоём примере.

Что такое IoC на пальцах
Обычный код работает так:

«Я сам создаю то, что мне нужно, и сам управляю процессом».

IoC работает наоборот:

«Мне дают то, что нужно, а процессом управляет кто‑то другой».

То есть код перестаёт быть главным, он становится «исполнителем».

Где в твоём примере уже есть IoC
1) Render не решает, что рисовать
Он получает:

js
render(listElement, items, store);
Render не выбирает фильтр, не сортирует, не знает, откуда items.
Им управляет внешний код → это и есть IoC.

Render — просто исполнитель.

2) Store не решает, когда обновлять UI
Store только меняет данные:

js
store.toggle(todo.id);
А решение «когда перерисовать» принимает внешний код:

js
refresh();
Store не вызывает refresh сам → это инверсия управления.

3) Фильтры — это стратегии, переданные извне
Store не знает, как фильтровать:

js
store.getItems(filters[currentFilter], sortByPriority);
Store не выбирает стратегию — её выбирает внешний код.
Store просто выполняет переданную функцию.

Это классический IoC через стратегию.

Как показать IoC студентам на контрасте
❌ Без IoC (плохой вариант)
js
function refresh() {
  const items = store.getItems();
  const filtered = items.filter(item => item.completed);
  const sorted = filtered.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  render(listElement, sorted, store);
}
Здесь refresh сам:

решает, какой фильтр использовать,

решает, как сортировать,

решает, что передать в render.

Он «главный» → нет IoC.

✔ С IoC (как у тебя)
js
const items = store.getItems(filters[currentFilter], sortByPriority);
render(listElement, items, store);
Теперь:

фильтр выбирает внешний код,

сортировку выбирает внешний код,

refresh только «склеивает» зависимости.

Управление вынесено наружу → это IoC.

Как объяснить студентам одним предложением
В IoC код перестаёт сам решать, что делать — он получает решения извне и просто выполняет их.

Как показать IoC ещё ярче (минимальная демонстрация)
Ты можешь создать «фейковый» store:

js
const mockStore = {
  getItems: () => [{ text: "Тест", priority: "high", completed: false }],
  toggle: () => console.log("toggle"),
  remove: () => console.log("remove")
};
И вызвать:

js
render(listElement, mockStore.getItems(), mockStore);
UI будет работать, хотя store — поддельный.

Студенты увидят:

UI не управляет store,

store не управляет UI,

всё связывает внешний код → это и есть IoC.
*/