const tasksRouter = require('express').Router()
const Task = require('../models/task')
const { userExtractor } = require('../utils/middleware')

tasksRouter.get('/', async (request, response) => {
  const tasks = await Task.find({}).populate('user', { username: 1, name: 1 })

  response.json(tasks)
})


tasksRouter.get('/:id', async (request, response) => {
  const task = await Task.findById(request.params.id)
  if (task) {
    response.json(task)
  }
  else {
    response.status(404).end()
  }
})

tasksRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  const task = await new Task({
    task: body.task,
    body: body.body,
    priority: body.priority,
    due: body.due,
    created: body.created,
    done: body.done,
    user: user._id
  })

  if (!task.task) {
    response.status(400).end()
  }
  else {
    const savedTask = await task.save()
    user.tasks = user.tasks.concat(savedTask._id)
    await user.save()

    response.status(201).json(savedTask)
  }
})

tasksRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = await request.user
  const taskToDelete = await Task.findById(request.params.id).populate('user', { id: 1 })
  if (taskToDelete.user.toString() === user.id.toString()){
    await Task.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } 
  else if (taskToDelete.user._id.toString() === user.id.toString()) {
    await Task.findByIdAndRemove(request.params.id)
    response.status(204).end()
  }else{
    return response.status(401).json({ error: 'token missing or invalid' })
  }
})

tasksRouter.put('/:id', async (request, response) => {
  const body = request.body

  const task = {
    task: body.task,
    body: body.body,
    priority: body.priority,
    due: body.due,
    created: body.created,
    done: body.done,
    user: user._id
  }

  const updatedTask = await Task.findByIdAndUpdate(request.params.id, task, { new: true }).populate('user', { name: 1 })
  response.status(201).json(updatedTask)
})

module.exports = tasksRouter