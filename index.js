import express from 'express'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

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

app.listen(process.env.PORT, () => {
  console.log(
    `Airpnp server is running on http://localhost:${process.env.PORT}`
  )
})
