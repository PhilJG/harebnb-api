import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/houses-pictures', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM houses_pictures')
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

let photoId = 11

router.get(`/houses-pictures/${photoId}`, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM houses_pictures WHERE photo_id = ${photoId}`
    )
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

export default router
