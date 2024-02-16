import { Router } from 'express'

const router = Router()

router.get('/photos', (req, res) => {
  res.json([
    { id: 1, white_house: '' },
    { id: 2, red_house: '' }
  ])
})

router.get('/photos/1', (req, res) => {
  res.json({ id: 1, white_house: '' })
})

export default router
