let timeLeft;
let timerId = null;
let todos = JSON.parse(localStorage.getItem('todos')) || [];

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const modeToggle = document.getElementById('mode-toggle');
const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');

function updateDisplay(minutes, seconds) {
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
    
    // Update the tab title with the remaining time
    const mode = modeToggle.checked ? 'rest' : 'work';
    const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
    document.title = `(${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}) ${modeText} - Pomodoro Timer`;
}

function setTimer(minutes) {
    timeLeft = minutes * 60;
    updateDisplay(minutes, 0);
}

function switchMode(mode) {
    if (mode === 'work') {
        modeToggle.checked = false;
        setTimer(25);
    } else {
        modeToggle.checked = true;
        setTimer(5);
    }
}

function startTimer() {
    if (timerId !== null) return;
    
    timerId = setInterval(() => {
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timerId);
            timerId = null;
            
            const currentMode = modeToggle.checked ? 'rest' : 'work';
            if (currentMode === 'work') {
                switchMode('rest');
            } else {
                switchMode('work');
            }
            
            // Play notification sound (if you want to add this feature)
            try {
                new Audio('notification.mp3').play();
            } catch (e) {
                console.log('Notification sound not available');
            }
            return;
        }
        
        updateDisplay(Math.floor(timeLeft / 60), timeLeft % 60);
    }, 1000);
}

function pauseTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function resetTimer() {
    pauseTimer();
    const mode = modeToggle.checked ? 'rest' : 'work';
    const minutes = mode === 'work' ? 25 : 5;
    setTimer(minutes);
}

// Todo list functions
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));
    
    const span = document.createElement('span');
    span.textContent = todo.text;
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-todo';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTodo(todo.id));
    
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteButton);
    
    return li;
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach(todo => {
        todoList.appendChild(createTodoElement(todo));
    });
}

function addTodo(text) {
    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };
    todos.push(todo);
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Event Listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

modeToggle.addEventListener('change', () => {
    if (timerId) {
        // If timer is running, pause it before switching modes
        pauseTimer();
    }
    const mode = modeToggle.checked ? 'rest' : 'work';
    const minutes = mode === 'work' ? 25 : 5;
    setTimer(minutes);
});

// Event Listeners for Todo List
addTodoButton.addEventListener('click', () => {
    const text = todoInput.value.trim();
    if (text) {
        addTodo(text);
        todoInput.value = '';
    }
});

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = todoInput.value.trim();
        if (text) {
            addTodo(text);
            todoInput.value = '';
        }
    }
});

// Initialize timer with work mode
setTimer(25);
renderTodos(); 