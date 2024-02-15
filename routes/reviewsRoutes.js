import { Router } from 'express'
const router = Router()

router.get('/reviews', (req, res) => {
  res.send([
    { id: 1, reviewTitle: 'Awesome location' },
    { id: 2, reviewTItle: 'Great Stay' }
  ])
})

router.get('/reviews/1', (req, res) => {
  res.send({ id: 1, reviewTitle: 'Awesome location' })
})

export default router
