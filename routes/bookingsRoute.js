import { Router } from 'express'
const router = Router()

router.get('/bookings', (req, res) => {
  res.json([
    { id: 1, bookingPrice: 200 },
    { id: 2, bookingPrice: 500 }
  ])
})

router.get('/bookings/1', (req, res) => {
  res.json({ id: 1, reviewbookingPrice: 200 })
})

export default router
