import express from 'express'
import signupRouter from './authRoutes/signup.js'
import loginRouter from './authRoutes/login.js'
import logoutRouter from './authRoutes/logout.js'

const app = express()

app.listen(4100, () => console.log(`Server running on port 4100`))
app.use(signupRouter)
app.use(loginRouter)
app.use(logoutRouter)
