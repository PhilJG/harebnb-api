import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/houses', async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM houses`)
    res.json(rows)
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})

let houseId = 1

router.get(`/houses/${houseId}`, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM houses WHERE house_id = ${houseId}`
    )
    res.json(rows)
    res.json(rows)
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})

export default router
