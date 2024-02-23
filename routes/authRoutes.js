import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
import { jwtSecret } from '../secrets.js'
import bcrypt from 'bcrypt'

const router = Router()

//Signup POST or create a new user
router.post('/signup', async (req, res) => {
  try {
    const newUser = req.body

    // check if user email exists
    const queryResult = await db.query(`
    SELECT * FROM users 
    WHERE email ='${newUser.email}'
    `)

    if (queryResult.rowCount) {
      throw new Error('Email already exists')
    }

    //hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newUser.password, salt)

    //create the user
    const queryString = `INSERT INTO users (first_name, last_name, email, password)
    VALUES ('${newUser.first_name}', '${newUser.last_name}', '${newUser.email}', '${hashedPassword}')
    RETURNING user_id, email`

    const insertion = await db.query(queryString)

    //creating the token
    let payload = {
      email: newUser.email,
      user_id: newUser.user_id
    }

    console.log(payload)

    let token = jwt.sign(payload, jwtSecret)
    console.log(token)

    // creating the cookie
    res.cookie('jwt', token)
    res.json(insertion.rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

//LOGIN POST user already in DB
router.post('/login', async (req, res) => {
  const { password, email } = req.body

  const queryString = `SELECT * FROM users WHERE users.email = '${email}' AND users.password = '${password}'`

  try {
    const { rows } = await db.query(queryString)
    if (rows.length === 0) {
      throw new Error('User not found or password incorrect')
    }
    res.json({ rows }.rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

router.get('/logout', (req, res) => {
  res.send('log out')
})

export default router
