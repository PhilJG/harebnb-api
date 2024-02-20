import { Router } from 'express'
import db from '../db.js' // import the database connection

const router = Router()

router.get('/bookings', async (req, res) => {
  // don't forget async
  try {
    const { rows } = await db.query('SELECT * FROM bookings') // query the database
    console.log(rows)
    res.json(rows) // respond with the data
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

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
