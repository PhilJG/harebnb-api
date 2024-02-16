import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/houses', async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM houses`)
    res.json(rows)
  } catch (err) {
    console.log(err.message)
    res.json(err)
  }
})

router.get('/houses/1', (req, res) => {
  res.json({ id: 1, location: 'Italy' })
})

export default router
