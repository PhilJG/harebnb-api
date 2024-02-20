import express from 'express'
import authRoute from './routes/authRoutes.js'
import housesRoutes from './routes/housesRoutes.js'
import usersRouter from './routes/usersRouter.js'
import bookingsRoute from './routes/bookingsRoute.js'
import reviewsRoutes from './routes/reviewsRoutes.js'
import photosRouter from './routes/photosRoutes.js'

const app = express()

app.use(photosRouter)
app.use(reviewsRoutes)
app.use(bookingsRoute)
app.use(housesRoutes)
app.use(usersRouter)
app.use(authRoute)

console.log('all good')

app.listen(4100, () => {
  console.log('Airbnb IS API ready on localhost:4100')
})
