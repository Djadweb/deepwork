import React, { useState, useEffect } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
}

const LS_KEY = 'dw:todos'

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem(LS_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false }])
      setInput('')
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <section className="todo-list">
      <h3>todo list</h3>
      <div className="todo-input-group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="add a task..."
          className="todo-input"
        />
        <button onClick={addTodo} className="btn primary">add</button>
      </div>
      <ul className="todo-items">
        {todos.map(todo => (
          <li key={todo.id} className="todo-item">
            <span 
              className={`todo-label ${todo.completed ? 'completed' : ''}`}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)} className="btn-delete" aria-label="Delete todo">×</button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p className="empty-state">no tasks yet</p>}
    </section>
  )
}
