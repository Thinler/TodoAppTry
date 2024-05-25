let lastDeletedTask = null;

document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    document.getElementById('add-task-btn').addEventListener('click', toggleTaskForm);
});

function toggleTaskForm() {
    const form = document.getElementById('task-form-modal');
    form.classList.toggle('hidden');
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    document.getElementById('incomplete-tasks').innerHTML = '';
    document.getElementById('completed-tasks').innerHTML = '';
    tasks.forEach(task => {
        let listItem = createTaskElement(task.text, task.completed, task.creator, task.deadline);
        if (task.completed) {
            document.getElementById('completed-tasks').appendChild(listItem);
        } else {
            document.getElementById('incomplete-tasks').appendChild(listItem);
        }
    });
}

function createTaskElement(taskText, completed, creator, deadline) {
    let listItem = document.createElement('li');
    listItem.textContent = taskText;

    let tagSpan = document.createElement('span');
    tagSpan.textContent = ` (#${creator} ${deadline})`;
    tagSpan.className = "tags";
    listItem.appendChild(tagSpan);

    listItem.classList.toggle('completed', completed);
    listItem.addEventListener('click', function() {
        listItem.classList.toggle('completed');
        updateTaskInStorage(taskText, listItem.classList.contains('completed'), creator, deadline);
        moveTask(listItem);
    });

    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = "删除";
    deleteBtn.onclick = function() { deleteTask(taskText, creator, listItem); };
    listItem.appendChild(deleteBtn);

    return listItem;
}

function addNewTask() {
    let taskText = document.getElementById('task-text').value;
    let creator = document.getElementById('task-creator').value.replace('#', '');
    let deadline = document.getElementById('task-deadline').value;
    if (taskText && creator && deadline) {
        let listItem = createTaskElement(taskText, false, creator, deadline);
        document.getElementById('incomplete-tasks').appendChild(listItem);
        addTaskToStorage(taskText, false, creator, deadline);
        toggleTaskForm();
    }
    updateCreators(creator);
}

function addTaskToStorage(taskText, completed, creator, deadline) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ text: taskText, completed: completed, creator: creator, deadline: deadline });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskInStorage(taskText, completed, creator, deadline) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.text === taskText && task.creator === creator) {
            return {...task, completed};
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function moveTask(listItem) {
    if (listItem.classList.contains('completed')) {
        document.getElementById('completed-tasks').appendChild(listItem);
    } else {
        document.getElementById('incomplete-tasks').appendChild(listItem);
    }
}

function deleteTask(taskText, creator, listItem) {
    lastDeletedTask = { taskText, creator, listItem };
    listItem.remove();
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks = tasks.filter(task => task.text !== taskText || task.creator !== creator);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateCreators(creator) {
    const creatorList = document.getElementById('creator-list');
    let option = document.createElement('option');
    option.value = creator;
    creatorList.appendChild(option);
}
