import { Router } from 'express'

const router = Router()

router.get('/signup', (req, res) => {
  res.send('sign up')
})

export default router
