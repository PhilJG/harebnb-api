import { Router } from 'express'
import db from '../db.js' // import database connection
import jwt from 'jsonwebtoken'

const router = Router()
const jwtSecret = process.env.JWT_SECRET

//routes to POST info on DATA BASE
router.post('/bookings', async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    const user_id = decodedToken.user_id

    if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    // Validate fields
    let { house_id, check_in, check_out, message } = req.body

    if (!house_id || !check_in || !check_out) {
      throw new Error('house_id, check_in, check_out, are required')
    }

    // Find house to get price
    let houseFound = await db.query(
      `SELECT house_id, price FROM houses WHERE house_id = ${house_id}`
    )
    if (!houseFound.rows.length) {
      throw new Error(`House with id ${house_id} not found`)
    }
    const house = houseFound.rows[0]

    // Calculate total price
    let checkInDate = new Date(req.body.check_in)
    let checkOutDate = new Date(req.body.check_out)
    if (checkOutDate <= checkInDate) {
      throw new Error('check_out date must be after check_in date')
    }

    // Set booked_on date
    const booked_on = new Date().toISOString().slice(0, 10)

    // Calculate total nights
    const totalNights = Math.round(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    )

    // Calculate total price
    const totalPrice = totalNights * house.price

    const { rows } =
      await db.query(`INSERT INTO bookings (user_id, house_id, check_in, check_out, total_days, total_price, booked_on, message)
      VALUES (${user_id}, ${house_id}, '${check_in}', '${check_out}',${totalNights}, ${totalPrice}, '${booked_on}', '${message}')
      RETURNING * `)

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

//routes to GET info from DATA BASE
router.get('/bookings', async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)

    if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }

    // Get bookings
    let sqlquery = `
    SELECT
    TO_CHAR(bookings.check_in, 'D Mon yyyy') AS check_in,
    TO_CHAR(bookings.check_out, 'D Mon yyyy') AS check_out,
    bookings.total_days,
    bookings.total_price,
    houses.house_id,
    houses.price AS price,
    houses.location,
    houses.rooms,
    houses.bathrooms,
    houses.reviews_count,
    houses.rating,
    house_photos.url as house_photos
  FROM bookings
  LEFT JOIN houses ON houses.house_id = bookings.house_id
   LEFT JOIN (
       SELECT DISTINCT ON (house_id) house_id, url
       FROM house_photos
   ) AS house_photos ON house_photos.house_id = houses.house_id
  WHERE bookings.user_id = ${decodedToken.user_id}
  ORDER BY bookings.check_in DESC
`
    // Respond
    let { rows } = await db.query(sqlquery)
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
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

export default router
