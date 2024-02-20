import { Router } from 'express'
import db from '../db.js' // import database connection

const router = Router()

//
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
