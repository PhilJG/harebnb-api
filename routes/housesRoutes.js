import { Router } from 'express'

const router = Router()

router.get('/houses', (req, res) => {
  res.json([
    { id: 1, location: 'Italy' },
    { id: 2, location: 'Canada' },
    { id: 3, location: 'Thailand' },
    { id: 4, location: 'Spain' }
  ])
})

router.get('/houses/1', (req, res) => {
  res.json({ id: 1, location: 'Italy' })
})

export default router
