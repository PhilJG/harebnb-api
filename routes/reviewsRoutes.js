import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/reviews', async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM reviews`)
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

router.get(`/reviews/:reviewId`, async (req, res) => {
  let reviewId = req.params.reviewId
  console.log(reviewId)

  try {
    const { rows } = await db.query(
      `SELECT * FROM reviews WHERE review_id = ${reviewId}`
    )
    if (!rows.length) {
      throw new Error(`Review ID ${reviewId} not found`)
    }
    res.json(rows)
    console.log(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

export default router
