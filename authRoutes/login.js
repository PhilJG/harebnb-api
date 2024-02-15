import { Router } from 'express'

const router = Router()

router.get('/login', (req, res) => {
  res.send('log in')
})

export default router
