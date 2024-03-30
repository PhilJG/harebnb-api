// Import necessary modules
import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const router = Router()
const jwtSecret = process.env.JWT_SECRET

// Signup POST or create a new user
router.post('/signup', async (req, res) => {
  // Extract user data from request body
  const newUser = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    profile_pic: req.body.profile_pic
  }

  try {
    // Validation checks
    if (!newUser.email) throw new Error('Email is required')
    if (!newUser.password) throw new Error('Password is required')
    if (!newUser.first_name) throw new Error('First name is required')
    if (!newUser.last_name) throw new Error('Last name is required')
    if (!newUser.profile_pic) throw new Error('Picture is required')
    if (newUser.password.length < 6)
      throw new Error('Password must be at least 6 characters')

    // Check for duplicate email
    const userExists = await db.query(
      `SELECT * FROM users WHERE email = $1`, // Use parameterized query to prevent SQL injection
      [newUser.email] // Pass email as a parameter
    )

    if (userExists.rows.length) throw new Error('User already exists')

    // Hash the password
    const salt = await bcrypt.genSalt(9)
    const hashedPassword = await bcrypt.hash(newUser.password, salt)

    // Create the user
    const queryString = `INSERT INTO users (first_name, last_name, email, password, profile_pic)
VALUES ($1, $2, $3, $4, $5)
RETURNING user_id, email`

    const values = [
      newUser.first_name,
      newUser.last_name,
      newUser.email,
      hashedPassword,
      newUser.profile_pic
    ]

    let user = (await db.query(queryString, values)).rows[0]

    // Creating the token
    const token = jwt.sign({ user_id: user.user_id }, jwtSecret)
    res.cookie('jwt', token)

    // Compose response
    delete user.password

    // Respond
    res.json(user)
  } catch (err) {
    res.json({ error: err })
  }
})

//LOGIN POST user already in DB
router.post('/login', async (req, res) => {
  const { password, email, user_id, first_name, last_name } = req.body
  let dbpassword = `SELECT * FROM users WHERE users.email = '${email}'`
  try {
    let { rows } = await db.query(dbpassword)

    const isPswValid = await bcrypt.compare(password, rows[0].password)

    if (rows.length === 0) {
      throw new Error('User not found or password incorrect')
    }

    if (isPswValid) {
      let payload = {
        email: rows[0].email,
        user_id: rows[0].user_id
      }

      let token = jwt.sign(payload, jwtSecret)
      res.cookie('jwt', token)

      res.json(`${rows[0].last_name} you are logged in`)
    }
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Logout user
router.get('/logout', (req, res) => {
  res.clearCookie('jwt')
  res.send('You are logged out')
})

export default router
