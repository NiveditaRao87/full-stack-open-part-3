const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())

app.use(cors())

app.use(express.static('build'))

morgan.token('data', req => JSON.stringify(req.body))

app.use([morgan('tiny'),morgan(':data',{skip: req => req.method !== 'POST'})])

let persons = [
    { 
      "name": "Arto Hellas", 
      "number": "040-123456",
      "id": 1
    },
    { 
      "name": "Ada Lovelace", 
      "number": "39-44-5323523",
      "id": 2
    },
    { 
      "name": "Dan Abramov", 
      "number": "12-43-234345",
      "id": 3
    },
    { 
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122",
      "id": 4
    }
]

app.get('/api/persons',(req,res)=>{
    res.json(persons)
})

app.get('/api/info',(req,res)=>{
    persons.length > 1 ?
    res.send(`<p>Phonebook has ${persons.length} people</p>
    <p>${new Date()}</p>`)
    : persons.length === 1 ?
    res.send(`<p>Phonebook has 1 person</p>
    <p>${new Date()}</p>`)
    : res.send(`<p>Phonebook is empty</p>
    <p>${new Date()}</p>`)

})

app.get('/api/persons/:id',(req,res)=>{
    
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    if(person){
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.post('/api/persons',(req,res)=>{
    
    const body = req.body
    let error

    !body.name ? error = 'Name missing' 
    : !body.number ? error = 'Number missing'
    : persons.find(person => person.name === body.name) ? error = `Name must be unique`
    : error = null

    if(error){
        return res.status(400).json({error})
    } 
    const id = Math.floor(Math.random() * 10000)
    const {name,number} = body
    const person = {name,number,id}
    persons = persons.concat(person)

    res.json(person)

})

app.delete('/api/persons/:id',(req,res)=>{
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
    
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server is listening at port ${PORT}`)