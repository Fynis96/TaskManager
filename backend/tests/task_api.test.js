const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Task = require('../models/task')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  await Task.deleteMany({})

  for (let user of helper.initialUsers) {
    let userObject = new User(user)
    await userObject.save()
  }

  for (let task of helper.initialTasks) {
    let taskObject = new Task(task)
    await taskObject.save()
  }
})

const getToken = async () => {
  const user = await api
      .post('/api/users')
      .send({ username: 'Valid user', password: 'valid' })
      .expect(201)
      .expect('Content-Type', /application\/json/)

  const token = await api
      .post('/api/login/')
      .send({ username: user.body.username, password: 'valid' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

  return token
}

describe('getters', () => {
  test('tasks returned json format', async () => {
    await api
      .get('/api/tasks')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('length of two tasks', async () => {
    const response = await api.get('/api/tasks')

    expect(response.body).toHaveLength(helper.initialTasks.length)
  })

  test('second task returns proper info', async () => {
    const response = await api.get('/api/tasks')

    expect(response.body[1].priority).toBe(10)
    expect(response.body[1].task).toBe('Second Task')
  })

  test('specific task can be viewed by id', async () => {
    const tasksAtStart = await helper.tasksInDb()

    const taskToView = tasksAtStart[0]

    const resultTask = await api
      .get(`/api/tasks/${taskToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      const processedTaskToView = JSON.parse(JSON.stringify(taskToView))

      expect(resultTask.body).toEqual(processedTaskToView)
  })
})

describe('posters', () => {
  test('a valid task can be added', async () => {
    const newTask = {
      task: 'valid task',
      body: 'valid body',
      priority: 10,
      due: 'valid due'
    }
    const token = await getToken()

    await api
      .post('/api/tasks')
      .send(newTask)
      .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json' })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const tasksAtEnd = await helper.tasksInDb()
    expect(tasksAtEnd).toHaveLength(helper.initialTasks.length + 1)

    const titles = tasksAtEnd.map(property => property.task)

    expect(titles).toContain('valid task')
    
  })
})

describe('deleters', () => {
  test('a task will be deleted if the user created it', async () => {
    const tasksAtStart = await helper.tasksInDb()

    const token = await getToken()

    const createdTask = await api
    .post('/api/tasks')
    .send({ task: 'to delete', body: 'to delete', priority: 0, due: 'never' })
    .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json' })
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const taskToDelete = createdTask.body
    const tasksAfterCreation = await helper.tasksInDb()
    expect(tasksAfterCreation).toHaveLength(tasksAtStart.length + 1)

    await api
      .delete(`/api/tasks/${taskToDelete.id}`)
      .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json' })
      .expect(204)

    const tasksAtEnd = await helper.tasksInDb()
    expect(tasksAtEnd).toHaveLength(tasksAtStart.length)
  })
})

describe('putters', () => {
  test('a task can be updated by user that created it', async () => {
    const token = await getToken()

    const createdTask = await api
    .post('/api/tasks')
    .send({ task: 'to edit', body: 'to edit', priority: 0, due: 'edit' })
    .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json' })
    .expect(201)
    .expect('Content-Type', /application\/json/)

    expect(createdTask.body).toMatchObject({ task: 'to edit', body: 'to edit', priority: 0, due: 'edit' })

    const taskToEdit = createdTask.body
    const updatedTask = {
      task: 'I have been updated',
      body: 'Updated here',
      priority: 5,
      due: 'Updated lol'
    }

    const finalTask = await api
      .put(`/api/tasks/${taskToEdit.id}`)
      .send(updatedTask)
      .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json' })
      .expect(201)
      .expect('Content-Type', /application\/json/)
      
    expect(finalTask.body).toMatchObject(updatedTask)
  })
})