import express from 'express'
import authRoute from './routes/authRoutes.js'

const app = express()

app.use(authRoute)

app.listen(4100, () => console.log(`Server running on port 4100`))
