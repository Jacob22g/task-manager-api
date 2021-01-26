const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app

//
// Without middleware:   new request -> run router handler
//
// With middleware:   new request -> do somthing -> run router handler
//