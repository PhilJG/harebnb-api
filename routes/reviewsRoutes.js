import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'

const router = Router()
const jwtSecret = process.env.JWT_SECRET

// send post request

router.post('/reviews', async (req, res) => {
  const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
  const user_id = decodedToken.user_id
  console.log(req.body)

  const { review_date, review, rating, house_id } = req.body

  // Validate house_id
  const houseQueryString = `SELECT * FROM houses WHERE house_id = ${house_id}`

  const { rows: houseRows } = await db.query(houseQueryString)
  if (houseRows.length === 0) {
    res.status(400).json({ error: 'Invalid house_id' })
    return
  }

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

  try {
    const { rows } = await db.query(
      `SELECT * FROM reviews WHERE review_id = ${reviewId}`
    )
    console.log('rows', rows)

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
