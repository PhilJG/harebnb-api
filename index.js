import express from 'express'

const app = express()

import housesRoutes from './routes/housesRoutes.js'

app.use(housesRoutes)

app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})
