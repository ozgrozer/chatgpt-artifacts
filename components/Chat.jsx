import { useState, useCallback } from 'react'

import styles from './../styles/chat.module.scss'

const clx = (...classes) => {
  return classes.join(' ')
}

const extractCodeFromBuffer = (buffer) => {
  const regex = /```(?:(html|css|js|javascript)?\s*)\n([\s\S]*?)```/g
  const matches = [...buffer.matchAll(regex)]
  return matches.map(match => ({
    language: match[1] || 'javascript',
    code: match[2].trim()
  }))
}

const _message = `
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
        li.innerHTML = \`task<button class="deleteBtn">Delete</button>\`;
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

export default () => {
  const [codeBlocks, setCodeBlocks] = useState(extractCodeFromBuffer(_message))
  const [message, setMessage] = useState(_message)
  const [prompt, setPrompt] = useState('make a todo app with html and js only')

  const fetchStream = useCallback(async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let _message = ''
      setMessage('')
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        _message = _message + chunk
        setCodeBlocks(extractCodeFromBuffer(_message))
        setMessage(prevChunk => prevChunk + chunk)
      }
    } catch (error) {
      console.error('Error fetching stream:', error)
      setMessage('Error: ' + error.message)
    }
  }, [prompt])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchStream()
  }

  return (
    <div className={clx(styles.wrapper, codeBlocks.length ? styles.codeBlocksActive : '')}>
      <div className={styles.responseWrapper}>
        <div className={styles.response}>
          {message && <pre>{message}</pre>}
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <input
            type='text'
            value={prompt}
            className={styles.input}
            placeholder='Enter your prompt'
            onChange={(e) => setPrompt(e.target.value)}
          />
        </form>
      </div>

      <div className={styles.codeBlocksWrapper}>
        {codeBlocks.map((block, index) => (
          <div key={index}>
            <h2>{block.language}</h2>
            <pre>{block.code}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
