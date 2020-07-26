if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())

app.use(cors())

app.use(express.static('build'))

morgan.token('data', req => JSON.stringify(req.body))

app.use([morgan('tiny'),morgan(':data',{ skip: req => req.method !== 'POST' })])

app.get('/api/persons',(request,response) => {
  Person.find({}).then(people => response.json(people))
})

app.get('/api/info',(request,response,next) => {

  Person.countDocuments({})
    .then(count => {count > 1 ?
      response.send(`<p>Phonebook has ${count} people</p>
        <p>${new Date()}</p>`)
      : count === 1 ?
        response.send(`<p>Phonebook has 1 person</p>
        <p>${new Date()}</p>`)
        :response.send(`<p>Phonebook is empty</p>
        <p>${new Date()}</p>`)})
    .catch(err => next(err))

})

app.get('/api/persons/:id',(request,response,next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person){
        response.json(person.toJSON())
      }else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons',(request,response,next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id',(request,response,next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id',(request,response,next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person,{ new: true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server is listening at port ${PORT}`)