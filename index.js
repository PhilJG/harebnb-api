import express from 'express'
import cookieParser from 'cookie-parser'

import authRoute from './routes/authRoutes.js'
import housesRoutes from './routes/housesRoutes.js'
import usersRouter from './routes/usersRoutes.js'
import bookingsRoute from './routes/bookingsRoutes.js'
import reviewsRoutes from './routes/reviewsRoutes.js'
import photosRouter from './routes/photosRoutes.js'

const app = express()

//middleware
app.use(express.json())
app.use(cookieParser())

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
