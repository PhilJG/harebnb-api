import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users')

    res.json(rows)
  } catch (err) {
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

    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

// Create a new PATCH route for /users/:user_id, add it below the 2 existing GET routes

router.patch('/users/:user_id', async (req, res) => {
  const { first_name, last_name, email, password, picture } = req.body

  let queryArray = []

  if (first_name) {
    queryArray.push(` first_name = '${first_name}'`)
  }
  if (last_name) {
    queryArray.push(` last_name = '${last_name}'`)
  }
  if (email) {
    queryArray.push(` email = '${email}'`)
  }
  if (password) {
    queryArray.push(` password = '${password}'`)
  }
  if (picture) {
    queryArray.push(` profile_picture = '${picture}'`)
  }

  queryArray = queryArray.join(',')

  let queryString = `UPDATE users SET ${queryArray} WHERE user_id = ${req.params.user_id}`

  try {
    const { rows } = await db.query(queryString)
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
