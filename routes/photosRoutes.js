import { Router } from 'express'
import db from '../db.js'

const router = Router()

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

export default router
