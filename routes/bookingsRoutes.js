import { Router } from 'express'
import db from '../db.js' // import database connection
import jwt from 'jsonwebtoken'

const router = Router()
const jwtSecret = process.env.JWT_SECRET

//routes to POST info on DATA BASE
router.post('/bookings', async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)

    const { house_id, check_in, check_out, total_price, booked_on } = req.body

    const user_id = decodedToken.user_id

    const newBookingQuery = `INSERT INTO bookings (user_id, house_id, check_in, check_out, total_price, booked_on)
      VALUES (${decodedToken.user_id}, ${house_id}, '${check_in}', '${check_out}', ${total_price}, '${booked_on}')
      RETURNING * `
    console.log(newBookingQuery)

    const { rows } = await db.query(newBookingQuery)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

//routes to GET info from DATA BASE
router.get('/bookings', async (req, res) => {
  let userBooking = ''
  let userId = req.query.user

  try {
    if (userId) {
      userBooking = `SELECT * FROM bookings WHERE user_id = ${userId} ORDER BY check_in DESC`
    }
    if (!userId) {
      userBooking = `SELECT * FROM bookings ORDER BY check_in DESC`
    }
    console.log(userBooking)
    const { rows } = await db.query(userBooking)
    if (!rows.length) {
      throw new Error(`There is no booking corresponding to this user.`)
    }
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

// route to a specific house if with params
router.get('/bookings/:bookingId', async (req, res) => {
  let bookingId = req.params.bookingId
  try {
    const { rows } = await db.query(
      `SELECT * FROM bookings WHERE booking_id = ${bookingId}`
    )
    if (!rows.length) {
      throw new Error(`The booking Id number ${bookingId} does not exist.`)
    }
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

export default router
