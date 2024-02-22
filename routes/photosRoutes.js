import { Router } from 'express'
import db from '../db.js'

const router = Router()

<<<<<<< Updated upstream
=======
//POST PHOTOS ROUTE
router.post('/photos', async (req, res) => {
  const { photo_url, house_id } = req.body
  console.log(req.body)

  const newPhotoQuery = `INSERT INTO houses_pictures (photo_url, house_id)
      VALUES ('${photo_url}', ${house_id})
      RETURNING * `
  console.log(newPhotoQuery)
  try {
    const { rows } = await db.query(newPhotoQuery)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

// GET PHOTOS ROUTES
>>>>>>> Stashed changes
router.get('/photos', async (req, res) => {
  let houseId = req.query.house

  let queryString = `SELECT * FROM houses_pictures WHERE house_id = ${houseId}`

  if (houseId) {
    queryString += ``
  }

  try {
    const { rows } = await db.query(queryString)

    console.log(`rows.length ${rows.length}`)

    if (!rows.length) {
      throw new Error('house parameter is required')
    }

    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

router.get('/photos/:photoId', async (req, res) => {
  let photoId = req.params.photoId
  try {
    const { rows } = await db.query(
      `SELECT * FROM houses_pictures WHERE photo_id = ${photoId}`
    )
    if (!rows.length) {
      throw new Error(`The photo Id number ${photoId} does not exist.`)
    }
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

////PATCH PHOTOS ID ROUTE
router.patch('/photos/:photoId', async (req, res) => {
  let photoIdPatch = req.params.photoId
  let photoUrl = req.body.photo_url

  try {
    const { rows } = await db.query(`UPDATE houses_pictures
      SET photo_url = '${photoUrl}'
      WHERE photo_id = ${photoIdPatch} 
      RETURNING photo_url `)

    if (!rows.length) {
      throw new Error('The house ID provided is not valid')
    }

    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

export default router
