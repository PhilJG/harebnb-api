import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'

const router = Router()
const jwtSecret = process.env.JWT_SECRET

// send post request

router.post('/reviews', async (req, res) => {
  const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
  const user_id = decodedToken.user_id

  const { review_date, review, rating, house_id } = req.body

  const postQueryString = `INSERT INTO reviews (review_date, review, rating, user_id, house_id)
  VALUES ('${review_date}', '${review}', ${rating}, ${user_id}, ${house_id} )
  RETURNING * `
  try {
    const { rows } = await db.query(postQueryString)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

// send reviews queries

router.get('/reviews', async (req, res) => {
  try {
    const { house_id } = req.query
    let queryString = `SELECT * FROM reviews`
    let queryParams = []

    if (house_id) {
      queryString += ` WHERE house_id = $1`
      queryParams.push(house_id)
    }

    const { rows } = await db.query(queryString, queryParams)
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

    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

router.delete('/reviews/:review_id', async (req, res) => {
  let deleteQueryString = `DELETE FROM reviews WHERE review_id = ${req.params.review_id}`

  const { rows } = await db.query(deleteQueryString)
  try {
    res.json(rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
