import { Router } from 'express'
import db from '../db.js'
// import { jwtSecret } from '../secrets.js'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/houses', async (req, res) => {
  try {
    const { location, price_per_night, bedroom, bathroom, description } =
      req.body

    //declare the token from the jwt property in the cookie
    let token = req.cookies.jwt

    // if token doesn't exist throw error
    if (!token) {
      throw new Error('Invalid authentication token')
    }

    //else if token does exist verify user_id from the token
    const { user_id } = jwt.verify(token, process.env.PRIVATE_KEY)

    const queryString = `INSERT INTO houses (location, price_per_night, bedroom, bathroom, description, user_id)
    VALUES (
      '${location}',
      ${price_per_night},
      ${bedroom},
      ${bathroom},
      '${description}',
      ${user_id}) 
      RETURNING *`

    // console.log(queryString)

    console.log(token)

    const { rows } = await db.query(queryString)
    console.log(rows)

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// route gets all the houses and if there is a query it gives the results of the query

router.get('/houses', async (req, res) => {
  try {
    // build query base
    let sqlquery =
      'SELECT * FROM (SELECT DISTINCT ON (houses.house_id) houses.*, houses_photos.photo FROM houses'
    let filters = []
    // add photos
    sqlquery += ` LEFT JOIN houses_photos ON houses.house_id = houses_photos.house_id `
    // add WHERE
    if (
      req.query.location ||
      req.query.max_price ||
      req.query.min_rooms ||
      req.query.search
    ) {
      sqlquery += ' WHERE '
    }
    // add filters
    if (req.query.location) {
      filters.push(`location = '${req.query.location}'`)
    }
    if (req.query.max_price) {
      filters.push(`price <= '${req.query.max_price}'`)
    }
    if (req.query.min_rooms) {
      filters.push(`rooms >= '${req.query.min_rooms}'`)
    }
    if (req.query.search) {
      filters.push(`description LIKE '%${req.query.search}%'`)
    }
    // array to string divided by AND
    sqlquery += filters.join(' AND ')
    sqlquery += ') AS distinct_houses'
    // add ORDER BY
    if (req.query.sort === 'rooms') {
      sqlquery += ` ORDER BY rooms DESC`
    } else {
      sqlquery += ` ORDER BY price ASC`
    }
    // Run query
    let { rows } = await db.query(sqlquery)
    // Respond
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})
// this route gets a specific house ID based on the route parameter

router.get('/houses/:houseId', async (req, res) => {
  let houseId = req.params.houseId
  try {
    const { rows } = await db.query(
      `SELECT * FROM houses WHERE house_id = ${houseId}`
    )
    //if the array is empty throws a specific error
    if (!rows.length) {
      throw new Error(`The house Id number ${houseId} does not exist.`)
    }
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})

// patch houses route

router.patch('/houses/:houseId', async (req, res) => {
  let houseId = req.params.houseId
  const { location, price_per_night, bedroom, bathroom, description, user_id } =
    req.body
  let patchQueryString = ` UPDATE houses`
  try {
    if (
      location ||
      price_per_night ||
      bedroom ||
      bathroom ||
      description ||
      user_id
    ) {
      patchQueryString += ` SET`
      if (location) {
        patchQueryString += ` location = '${location}',`
      }
      if (price_per_night) {
        patchQueryString += ` price_per_night = ${price_per_night},`
      }
      if (bedroom) {
        patchQueryString += ` bedroom = ${bedroom},`
      }
      if (bathroom) {
        patchQueryString += ` bathroom = ${bathroom},`
      }
      if (description) {
        patchQueryString += ` description = '${description}',`
      }
      if (user_id) {
        patchQueryString += ` user_id = ${user_id},`
      }

      patchQueryString = patchQueryString.slice(0, -1)
      patchQueryString += ` WHERE house_id = ${houseId} RETURNING *`
    }

    const resQuery = await db.query(patchQueryString)
    const { rowCount, rows } = resQuery
    if (rowCount === 0) {
      throw new Error(`There is no house corresponding to this query.`)
    }
    res.json(rows[0])
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})

export default router
