const Task = require('../models/task')
const User = require('../models/user')

const initialTasks = [
  {
    task: 'First Task',
    body: 'Just a test',
    priority: 0,
    due: 'Whenever'
  },
  {
    task: 'Second Task',
    body: 'Oh shit',
    priority: 10,
    due: 'never'
  }
]

const initialUsers = [
  {
    username: 'Username1',
    name: 'User 1',
    password: '1111'
  },
  {
    username: 'Username2',
    name: 'User 2',
    password: '2222'
  }
]

const tasksInDb = async () => {
  const tasks = await Task.find({})
  return tasks.map(task => task.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialTasks, initialUsers, tasksInDb, usersInDb
}