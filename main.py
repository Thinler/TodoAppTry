import json
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)
DATA_FILE = 'tasks.json'

def load_tasks():
    try:
        with open(DATA_FILE, 'r') as file:
            tasks = json.load(file)
    except (IOError, ValueError):
        tasks = []
    return tasks

def save_tasks(tasks):
    with open(DATA_FILE, 'w') as file:
        json.dump(tasks, file)

tasks = load_tasks()

@app.route('/')
def index():
    return render_template('index.html')  # 修改此处以返回 index.html

@app.route('/api/tasks', methods=['GET', 'POST'])
def handle_tasks():
    if request.method == 'POST':
        task = request.json
        task['id'] = len(tasks) + 1
        tasks.append(task)
        save_tasks(tasks)
        return jsonify(task), 201

    return jsonify(tasks)

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
def handle_task(task_id):
    global tasks
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    if request.method == 'PUT':
        task.update(request.json)
        save_tasks(tasks)
        return jsonify(task)

    elif request.method == 'DELETE':
        tasks = [t for t in tasks if t['id'] != task_id]
        save_tasks(tasks)
        return jsonify({}), 204

if __name__ == '__main__':
    app.run(debug=True)
