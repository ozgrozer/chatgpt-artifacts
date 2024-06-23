export default `
Sure! Here's a simple todo app.

HTML:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Todo App</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="container">
<h1>Todo List</h1>
<input type="text" id="taskInput" placeholder="Add a new task...">
<button id="addTaskBtn">Add Task</button>
<ul id="taskList"></ul>
</div>
<script src="script.js"></script>
</body>
</html>
\`\`\`

CSS:
\`\`\`css
body {
  font-family: Arial, sans-serif;
  background-color: #f3f3f3;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
}

input[type="text"] {
  width: 70%;
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: #fff;
  border-radius: 5px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px 0;
}

.deleteBtn {
  background-color: #dc3545;
  color: #fff;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
}

.completed {
  text-decoration: line-through;
  color: #6c757d;
}
\`\`\`

JavaScript:
\`\`\`javascript
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

addTaskBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    if (task !== '') {
        const li = document.createElement('li');
        li.innerHTML = \`\${task}<button class="deleteBtn">Delete</button>\`;
        taskList.appendChild(li);
        taskInput.value = '';
    }
});

taskList.addEventListener('click', (e) => {
    if (e.target.classList.contains('deleteBtn')) {
        e.target.parentElement.remove();
    } else {
        e.target.classList.toggle('completed');
    }
});
\`\`\`
`
