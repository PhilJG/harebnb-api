import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'

const router = Router()

const jwtSecret = process.env.JWT_SECRET

// Create house
router.post('/houses', async (req, res) => {
  try {
    // Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)

    if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    // Validate fields
    let { location, rooms, bathrooms, price, description, house_photos } =
      req.body
    if (
      !location ||
      !rooms ||
      !bathrooms ||
      !price ||
      !description ||
      !house_photos
    ) {
      throw new Error(
        'location, rooms, bathrooms, price, descriptions, and photos are required'
      )
    }

    // Validate photos
    if (!Array.isArray(house_photos)) {
      throw new Error('photos must be an array')
    }
    if (!house_photos.length) {
      throw new Error('house_photos array cannot be empty')
    }
    if (!house_photos.every((p) => typeof p === 'string' && p.length)) {
      throw new Error('all house_photos must be strings and must not be empty')
    }
    // Create house
    let houseCreated = await db.query(`
      INSERT INTO houses (location, rooms, bathrooms, price, description, user_id)
      VALUES ('${location}', '${rooms}', '${bathrooms}', '${price}', '${description}', '${decodedToken.user_id}') 
      RETURNING *
    `)
    let house = houseCreated.rows[0]

    // Create photos
    let photosQuery = 'INSERT INTO house_photos (house_id, url) VALUES '
    house_photos.forEach((p, i) => {
      if (i === house_photos.length - 1) {
        photosQuery += `(${house.house_id}, '${p}') `
      } else {
        photosQuery += `(${house.house_id}, '${p}'), `
      }
    })
    photosQuery += 'RETURNING *'
    let photosCreated = await db.query(photosQuery)
    // Compose response
    house.house_photos = photosCreated.rows[0].house_photos
    house.reviews = 0
    house.rating = 0

    // Respond
    res.json(house)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// List all houses
router.get('/houses', async (req, res) => {
  try {
    // build query base
    let sqlquery =
      'SELECT * FROM (SELECT DISTINCT ON (houses.house_id) houses.*, house_photos.url FROM houses'
    let filters = []
    // add photos
    sqlquery += ` LEFT JOIN house_photos ON houses.house_id = house_photos.house_id `
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

    // Execute the query to get houses
    let { rows: houses } = await db.query(sqlquery)

    // Add this block to get house_photos for each house
    for (let house of houses) {
      let { rows: photosRows } = await db.query(
        `SELECT * FROM house_photos WHERE house_id = ${house.house_id}`
      )
      // Extract URLs from photosRows and assign to house.house_photos
      house.house_photos = photosRows.map((photoRow) => photoRow.url)
    }

    // Return the houses with photos
    res.json(houses)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Get individual house based on id
router.get('/houses/:house_id', async (req, res) => {
  try {
    let { rows } = await db.query(
      `SELECT * FROM houses WHERE house_id = ${req.params.house_id}`
    )

    if (!rows.length) {
      throw new Error(`No house found with id ${req.params.user_id}`)
    }
    let house = rows[0]

    // join user
    let { rows: hostRows } = await db.query(
      `SELECT user_id, profile_pic, first_name, last_name FROM users WHERE user_id = ${house.user_id}`
    )

    house.hostRows = {
      user_id: hostRows[0].user_id,
      profile_pic: hostRows[0].profile_pic,
      firstName: hostRows[0].first_name,
      lastName: hostRows[0].last_name
    }
    // join photos
    let { rows: photosRows } = await db.query(
      `SELECT * FROM house_photos WHERE house_id = ${house.house_id}`
    )
    house.house_photos = photosRows.map((p) => p.url)
    delete house.user_id
    res.json(house)
  } catch (err) {
    res.json({ error: err.message })
  }
})

router.patch('/houses/:house_id', async (req, res) => {
  try {
    // Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    // Find house
    const { rows: housesRows } = await db.query(`
      SELECT * FROM houses WHERE house_id = ${req.params.house_id}
    `)
    if (!housesRows.length) {
      throw new Error(`house with id ${req.params.house_id} not found`)
    }
    // Validate house owner
    if (housesRows[0].user_id !== decodedToken.user_id) {
      throw new Error('You are not authorized to edit this house')
    }
    // Start building the SQL query
    let sqlquery = `UPDATE houses `
    // Add SET if the req.body object is not empty
    if (req.body) {
      sqlquery += `SET `
    }
    // Iterate over the keys of the req.body object and add each key-value pair to the SQL query
    for (let key in req.body) {
      if (
        key === 'location' ||
        key === 'rooms' ||
        key === 'bathrooms' ||
        key === 'price' ||
        key === 'description'
      ) {
        sqlquery += `${key} = '${req.body[key]}', `
      }
    }
    // Remove the trailing comma and space from the SQL query
    sqlquery = sqlquery.slice(0, -2)
    // Add the WHERE clause to the SQL query
    sqlquery += ` WHERE house_id = ${req.params.house_id} RETURNING *`
    // Execute the SQL query
    let { rows } = await db.query(sqlquery)
    let house = rows[0]
    // Update photos
    if (req.body.photos && req.body.photos.length) {
      let { rows: photosRows } = await db.query(
        `SELECT * FROM house_photos WHERE house_id = ${req.params.house_id}`
      )
      photosRows = photosRows.map((p, i) => {
        if (req.body.photos[i]) {
          p.photo = req.body.photos[i]
        }
        return p
      })
      let photosQuery = 'UPDATE house_photos SET photo = (case '
      photosRows.forEach((p, i) => {
        photosQuery += `when id = ${p.id} then '${p.photo}' `
      })
      photosQuery += 'end) WHERE id in ('
      photosRows.forEach((p, i) => {
        photosQuery += `${p.id}, `
      })
      photosQuery = photosQuery.slice(0, -2)
      photosQuery += ') RETURNING *'
      const { rows: updatedPhotos } = await db.query(photosQuery)
      house.images = updatedPhotos.map((p) => p.photo)
    }
    // Send the response
    res.json(house)
  } catch (err) {
    res.json({ error: err.message })
  }
})

router.get('/locations', async (req, res) => {
  try {
    let location = req.body.location
    let query = location
      ? `SELECT DISTINCT(location) FROM houses WHERE location = ${location}`
      : `SELECT DISTINCT(location) FROM houses`
    let { rows } = await db.query(query, location ? [location] : undefined)
    rows = rows.map((r) => r.location)
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

router.get('/listings', async (req, res) => {
  try {
    // Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    // Get houses
    let query = `SELECT * FROM houses LEFT JOIN house_photos ON houses.house_id = house_photos.house_id WHERE user_id = ${decodedToken.user_id}`

    let { rows } = await db.query(query)

    // Respond
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
