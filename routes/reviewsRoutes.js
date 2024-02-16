import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/reviews', async (req, res) => {
  try {
    const { rows } = db.query(`SELECT * FROM reviews`)
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

router.get('/reviews/1', (req, res) => {
  res.json({ id: 1, reviewTitle: 'Awesome location' })
})

export default router
