let timeLeft;
let timerId = null;
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentTask = null;
let currentTaskId = null;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const modeToggle = document.getElementById('mode-toggle');
const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const taskModal = document.getElementById('task-modal');
const taskSelect = document.getElementById('task-select');
const confirmTaskButton = document.getElementById('confirm-task');
const cancelTaskButton = document.getElementById('cancel-task');
const completionModal = document.getElementById('completion-modal');
const confirmCompletionButton = document.getElementById('confirm-completion');
const cancelCompletionButton = document.getElementById('cancel-completion');

function updateDisplay(minutes, seconds) {
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
    
    // Update the tab title with the remaining time and current task
    const mode = modeToggle.checked ? 'rest' : 'work';
    const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
    let title = `(${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}) ${modeText}`;
    if (currentTask && mode === 'work') {
        title += ` - ${currentTask}`;
    }
    title += ' - Pomodoro Timer';
    document.title = title;
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
        clearCurrentTask(); // Clear current task during rest
    }
}

function clearCurrentTask() {
    currentTask = null;
    currentTaskId = null;
    updateActiveTask();
}

function updateActiveTask() {
    // Remove active class from all tasks
    document.querySelectorAll('.todo-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to current task
    if (currentTaskId) {
        const activeTask = document.querySelector(`.todo-item[data-id="${currentTaskId}"]`);
        if (activeTask) {
            activeTask.classList.add('active');
        }
    }
}

function showTaskModal() {
    // Update task select options
    taskSelect.innerHTML = '<option value="">Select a task...</option>';
    const uncompletedTasks = todos.filter(todo => !todo.completed);
    uncompletedTasks.forEach(todo => {
        const option = document.createElement('option');
        option.value = todo.id;
        option.textContent = todo.text;
        taskSelect.appendChild(option);
    });

    taskModal.classList.add('show');
}

function hideTaskModal() {
    taskModal.classList.remove('show');
}

function showCompletionModal() {
    completionModal.classList.add('show');
}

function hideCompletionModal() {
    completionModal.classList.remove('show');
}

function startTimer() {
    if (timerId !== null) return;

    const isWorkMode = !modeToggle.checked;
    
    if (isWorkMode && !currentTask) {
        showTaskModal();
        return;
    }
    
    timerId = setInterval(() => {
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timerId);
            timerId = null;
            
            const currentMode = modeToggle.checked ? 'rest' : 'work';
            if (currentMode === 'work') {
                // Show completion modal before switching to rest mode
                showCompletionModal();
            } else {
                switchMode('work');
            }
            
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
    clearCurrentTask();
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
    li.className = 'todo-item' + (todo.completed ? ' completed' : '') + 
                  (todo.id === currentTaskId ? ' active' : '');
    li.dataset.id = todo.id;
    
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
        // If completed task is current task, clear it
        if (todo.completed && id === currentTaskId) {
            clearCurrentTask();
        }
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    // If deleted task is current task, clear it
    if (id === currentTaskId) {
        clearCurrentTask();
    }
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Event Listeners for Timer
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

modeToggle.addEventListener('change', () => {
    if (timerId) {
        pauseTimer();
    }
    clearCurrentTask();
    const mode = modeToggle.checked ? 'rest' : 'work';
    const minutes = mode === 'work' ? 25 : 5;
    setTimer(minutes);
});

// Event Listeners for Task Modal
confirmTaskButton.addEventListener('click', () => {
    const selectedTaskId = parseInt(taskSelect.value);
    if (selectedTaskId) {
        const task = todos.find(t => t.id === selectedTaskId);
        if (task) {
            currentTask = task.text;
            currentTaskId = task.id;
            updateActiveTask();
            hideTaskModal();
            startTimer();
        }
    }
});

cancelTaskButton.addEventListener('click', () => {
    hideTaskModal();
});

// Event Listeners for Completion Modal
confirmCompletionButton.addEventListener('click', () => {
    if (currentTaskId) {
        const todo = todos.find(t => t.id === currentTaskId);
        if (todo) {
            todo.completed = true;
            saveTodos();
            renderTodos();
        }
    }
    hideCompletionModal();
    switchMode('rest');
});

cancelCompletionButton.addEventListener('click', () => {
    hideCompletionModal();
    switchMode('rest');
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

// Initialize
setTimer(25);
renderTodos(); 