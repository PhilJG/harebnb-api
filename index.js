import express from 'express'
import housesRoutes from './routes/housesRoutes.js'
import usersRouter from './routes/usersRouter.js'
import bookingsRoute from './routes/bookingsRoute.js'

const app = express()
app.use(bookingsRoute)
app.use(housesRoutes)
app.use(usersRouter)


app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})