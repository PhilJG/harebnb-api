import express from 'express'
const app = express()

import usersRouter from './routes/usersRouter.js'

app.use(usersRouter)

app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})
