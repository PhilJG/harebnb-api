import express from 'express'
const app = express()
app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})

import bookingsRoute from './routes/bookingsRoute.js'
app.use(bookingsRoute)
