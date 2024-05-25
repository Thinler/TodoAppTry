document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    document.getElementById('add-task-btn').addEventListener('click', toggleTaskForm);
});

function toggleTaskForm() {
    const form = document.getElementById('task-form-modal');
    form.classList.toggle('hidden');
}

function loadTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            document.getElementById('incomplete-tasks').innerHTML = '';
            document.getElementById('completed-tasks').innerHTML = '';
            tasks.forEach(task => {
                let listItem = createTaskElement(task.id, task.text, task.completed, task.creator, task.deadline);
                if (task.completed) {
                    document.getElementById('completed-tasks').appendChild(listItem);
                } else {
                    document.getElementById('incomplete-tasks').appendChild(listItem);
                }
            });
        });
}

function createTaskElement(id, taskText, completed, creator, deadline) {
    let listItem = document.createElement('li');
    listItem.setAttribute('data-task-id', id);
    listItem.textContent = taskText;

    let tagSpan = document.createElement('span');
    tagSpan.textContent = ` (#${creator} ${deadline})`;
    tagSpan.className = "tags";
    listItem.appendChild(tagSpan);

    listItem.classList.toggle('completed', completed);
    listItem.addEventListener('click', function() {
        toggleCompleted(id, listItem.classList.contains('completed'));
    });

    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = "删除";
    deleteBtn.onclick = function() { deleteTask(id, listItem); };
    listItem.appendChild(deleteBtn);

    return listItem;
}

function addNewTask() {
    let taskText = document.getElementById('task-text').value;
    let creator = document.getElementById('task-creator').value.replace('#', '');
    let deadline = document.getElementById('task-deadline').value;
    fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: taskText, completed: false, creator, deadline })
    })
    .then(response => response.json())
    .then(task => {
        document.getElementById('incomplete-tasks').appendChild(createTaskElement(task.id, task.text, task.completed, task.creator, task.deadline));
        toggleTaskForm(); // Hide form after task is added
    });
}

function toggleCompleted(taskId, isCompleted) {
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !isCompleted })
    })
    .then(response => response.json())
    .then(task => {
        updateTaskInDOM(task.id, task.completed);
    });
}

function updateTaskInDOM(taskId, isCompleted) {
    const listItem = document.querySelector(`li[data-task-id="${taskId}"]`);
    if (listItem) {
        listItem.classList.toggle('completed', isCompleted);
        // Move task between lists if necessary
        if (isCompleted) {
            document.getElementById('completed-tasks').appendChild(listItem);
        } else {
            document.getElementById('incomplete-tasks').appendChild(listItem);
        }
    }
}

function deleteTask(taskId, listItem) {
    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
    })
    .then(() => {
        listItem.remove(); // Remove task element from DOM immediately after deleting
    });
}
