const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title: {type: String, required: true},
  body: {type: String, required: false},
  priority: {type: Number, default: 0},
  due: {type: String, required: false},
  created: {type: Date, default: Date.now},
  done: {type: Boolean, default: false},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

taskSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Task', taskSchema)

