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

router.get('/users/:userId', async (req, res) => {
  let userId = req.params.userId
  try {
    const { rows } = await db.query(
      `SELECT * FROM users WHERE user_id = ${userId}`
    )
    if (!rows.length) {
      throw new Error(`The user Id number ${userId} does not exist.`)
    }
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

export default router
