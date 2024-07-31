const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');
const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggleCheckbox.checked = false;
} else {
    document.body.classList.remove('light-theme');
    themeToggleCheckbox.checked = true;
}

themeToggleCheckbox.addEventListener('change', () => {
    if (themeToggleCheckbox.checked) {
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    }
});

let allTodos = getTodos();
updateTodoList();

todoForm.addEventListener('submit', function(e){
    e.preventDefault();
    addTodo();
});

function addTodo(){
    const todoText = todoInput.value.trim();
    if(todoText.length > 0){
        const todoObject = {
            text: todoText,
            completed: false,
            timestamp: Date.now(),
            completedTimestamp: null
        };
        // allTodos.push(todoObject);
        allTodos.unshift(todoObject);
        updateTodoList();
        saveTodos();
        todoInput.value = "";
    }
}

function updateTodoList(){
    todoListUL.innerHTML = "";

    allTodos.sort((a, b) => {
        if (a.completed && b.completed) {
            return a.completedTimestamp - b.completedTimestamp;
        } else if (a.completed) {
            return 1; 
        } else if (b.completed) {
            return -1; 
        } else {
            return b.timestamp - a.timestamp;
        }
    });

    allTodos.forEach((todo, todoIndex)=>{
        const todoItem = createTodoItem(todo, todoIndex);
        todoListUL.append(todoItem);
    });
}

function createTodoItem(todo, todoIndex){
    const todoId = "todo-"+todoIndex;
    const todoLI = document.createElement("li");
    todoLI.className = "todo";
    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}">
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">
            ${todo.text}
        </label>
        <input type="text" class="edit-input" value="${todo.text}">
        <button class="edit-button">
            <svg class="feather feather-edit" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="delete-button">
            <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
         <button class="save-button" style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6L20.6 7l-1.4-1.4z"/></svg>
        </button>
        <button class="cancel-button" style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
        </button>
    `;

    const deleteButton = todoLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", ()=>{
        deleteTodoItem(todoIndex);
    });

    const editButton = todoLI.querySelector(".edit-button");
    const saveButton = todoLI.querySelector(".save-button");
    const cancelButton = todoLI.querySelector(".cancel-button");
    const editInput = todoLI.querySelector(".edit-input");

    editButton.addEventListener("click", () => {
        todoLI.classList.add('editing');
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';
        saveButton.style.display = 'inline';
        cancelButton.style.display = 'inline';
        editInput.focus(); 
        editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    });

    editInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const newText = editInput.value.trim();
            if (newText.length > 0) {
                allTodos[todoIndex].text = newText;
                saveTodos();
                updateTodoList();
            }
        }
    });

    editInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            todoLI.classList.remove('editing');
            editButton.style.display = 'inline';
            deleteButton.style.display = 'inline';
            saveButton.style.display = 'none';
            cancelButton.style.display = 'none';
        } else if (event.key === 'Delete') {
            deleteTodoItem(todoIndex);
        }
    });

    saveButton.addEventListener("click", () => {
        const newText = editInput.value.trim();
        if (newText.length > 0) {
            allTodos[todoIndex].text = newText;
            saveTodos();
            updateTodoList();
        }
    });

    cancelButton.addEventListener("click", () => {
        todoLI.classList.remove('editing');
        editButton.style.display = 'inline';
        deleteButton.style.display = 'inline';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
    });

    const checkbox = todoLI.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", ()=>{
        allTodos[todoIndex].completed = checkbox.checked;
        allTodos[todoIndex].completedTimestamp = checkbox.checked ? Date.now() : null;
        saveTodos();
        updateTodoList();
    });
    checkbox.checked = todo.completed;

    return todoLI;
}

function deleteTodoItem(todoIndex){
    allTodos = allTodos.filter((_, i)=> i !== todoIndex);
    saveTodos();
    updateTodoList();
}

function saveTodos(){
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todosJson);
}

function getTodos(){
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}



