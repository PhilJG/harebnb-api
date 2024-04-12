import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.post('/photos', async (req, res) => {
  const { url, house_id } = req.body

  const newPhotoQuery = `INSERT INTO house_photos (url, house_id)
      VALUES ('${url}', ${house_id})
      RETURNING * `

      try {
    const { rows } = await db.query(newPhotoQuery)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err })
  }
})

// GET PHOTOS ROUTES
router.get('/photos', async (req, res) => {
  let houseId = req.body.house_id

  let queryString = `SELECT * FROM house_photos WHERE house_id = ${houseId}`

  if (houseId) {
    queryString += ``
  }

  try {
    const { rows } = await db.query(queryString)

    if (!rows.length) {
      throw new Error('house parameter is required')
    }

    res.json(rows)
  } catch (err) {
    res.json(err)
  }
})

router.get('/photos/:photoId', async (req, res) => {
  let photoId = req.params.photoId
  try {
    const { rows } = await db.query(
      `SELECT * FROM house_photos WHERE photo_id = ${photoId}`
    )
    if (!rows.length) {
      throw new Error(`The photo Id number ${photoId} does not exist.`)
    }

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

////PATCH PHOTOS ID ROUTE
router.patch('/photos/:photoId', async (req, res) => {
  let photoIdPatch = req.params.photoId
  let photoUrl = req.body.url

  try {
    const { rows } = await db.query(`UPDATE house_photos
      SET url = '${photoUrl}'
      WHERE photo_id = ${photoIdPatch} 
      RETURNING url `)

    if (!rows.length) {
      throw new Error('The house ID provided is not valid')
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
