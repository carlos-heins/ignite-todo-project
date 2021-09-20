const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.json({ error: "User Not Found" })
  }

  request.username = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some((user) => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User Already Exists!" })
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(400).json({ error: "Customer Not Found!" })
  }

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { title, deadline } = request.body

  const saveTodoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  username.todos.push(saveTodoOperation)

  return response.status(201).json(saveTodoOperation)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const todo = username.todos.find((todo) => todo.id === id) // const todo é uma referência para o todo que eu estava procurando

  if (!todo) {
    return response.status(404).json({ error: "Task Not Found!" })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params

  const todo = username.todos.find((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "Task Not Found!" })
  }

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params

  const todo = username.todos.find((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "Task Not Found!" })
  }

  username.todos.splice(username.todos.indexOf(todo), 1)

  return response.status(204).json(username.todos)
});

module.exports = app;