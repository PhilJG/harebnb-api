import { Router } from 'express'

const router = Router()

router.get('/logout', (req, res) => {
  res.send('log out')
})

export default router
