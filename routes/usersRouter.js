import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users')
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

let userId = 1

router.get(`/users/${userId}`, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM users WHERE user_id = ${userId}`
    )
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

export default router
