const jwt = require('jsonwebtoken')
const User = require('../models/user')
const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = (authorization.substring(7))
  }
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message 
    })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }}

const userExtractor = async (request, response, next) => {
  if(!(request.token)){
      return response.status(401).json({ error: 'token missing or invalid'})
  }
  else{
    const decodedToken = await jwt.verify(request.token, process.env.SECRET)

    if (!decodedToken.id){
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    request.user = await User.findById(decodedToken.id)

    next()
  }}


module.exports = {
  tokenExtractor, unknownEndpoint, errorHandler, userExtractor
}