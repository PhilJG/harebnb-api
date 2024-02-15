import { Router } from 'express'
const router = Router()

router.get('/users', (req, res) => {
  res.json([
    { id: 1, firstName: 'Silvia' },
    { id: 2, firstName: 'Phil' },
    { id: 3, firstName: 'Valeria' }
  ])
})

router.get('/users/1', (req, res) => {
  res.json({ id: 1, firstName: 'Silvia' })
})

export default router
