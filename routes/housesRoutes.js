import { Router } from 'express'
import db from '../db.js'

const router = Router()

// this route gets all the houses

router.get('/houses', async (req, res) => {
  let queryString = ''
  try {
    if (req.query.location) {
      queryString += req.query.location
    }
    if (!queryString) {
      const { rows } = await db.query(`SELECT * FROM houses`)
      res.json(rows)
    } else {
      const { rows } = await db.query(
        `SELECT * FROM houses WHERE location = '${queryString}'`
      )
      res.json(rows)
    }
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})
router.get('/houses', async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM houses WHERE location = ${location}`
  )
  console.log(rows)
  res.json(rows)
})

// this route gets a specific house ID based on the route parameter

router.get('/houses/:houseId', async (req, res) => {
  let houseId = req.params.houseId
  try {
    const { rows } = await db.query(
      `SELECT * FROM houses WHERE house_id = ${houseId}`
    )
    //if the array is empty throws a specific error
    if (!rows.length) {
      throw new Error(`The house Id number ${houseId} does not exist.`)
    }
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})

export default router
