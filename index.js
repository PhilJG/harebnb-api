import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true
  })
)


//middleware
app.use(express.json())
app.use(cookieParser())

import authRoute from './routes/authRoutes.js'
import housesRoutes from './routes/housesRoutes.js'
import usersRouter from './routes/usersRoutes.js'
import bookingsRoute from './routes/bookingsRoutes.js'
import reviewsRoutes from './routes/reviewsRoutes.js'
import photosRouter from './routes/photosRoutes.js'

app.use(photosRouter)
app.use(reviewsRoutes)
app.use(bookingsRoute)
app.use(housesRoutes)
app.use(usersRouter)
app.use(authRoute)

app.listen(process.env.PORT || 4100, () => {
  console.log(`Airbnb server is running on ${process.env.PORT || 4100}`)
})
