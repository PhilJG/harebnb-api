import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'

import 'dotenv/config'

import authRoute from './routes/authRoutes.js'
import housesRoutes from './routes/housesRoutes.js'
import usersRouter from './routes/usersRoutes.js'
import bookingsRoute from './routes/bookingsRoutes.js'
import reviewsRoutes from './routes/reviewsRoutes.js'
import photosRouter from './routes/photosRoutes.js'

const app = express()

app.use(
  cors({
    origin: ['https://harebnb-react.onrender.com/', true],
    credentials: true
  })
)

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Allow resources to be loaded from the same origin
      scriptSrc: [
        "'self'",
        "'unsafe-inline'"
        // 'https://your-external-scripts.com'
      ], // Allow scripts from self, inline scripts, and a specific domain
      imgSrc: [
        "'self'",
        'https://randomuser.me/api/portraits/*',
        'https://fakerapi.com/images/*',
        'https://www.philjgray.ca/light-image-profile.webp'
      ] // Allow images from self and a specific domain
      // Add more directives as needed (e.g., styleSrc, connectSrc, etc.)
    }
  })
)

//middleware
app.use(express.json())
app.use(cookieParser())

app.use(photosRouter)
app.use(reviewsRoutes)
app.use(bookingsRoute)
app.use(housesRoutes)
app.use(usersRouter)
app.use(authRoute)

app.listen(process.env.PORT || 4100, () => {
  console.log(`Harebnb API server is running on ${process.env.PORT || 4100}`)
})
