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

  try {
    // Validation checks
    if (!req.body.email) throw new Error('Email is required')
    if (!req.body.password) throw new Error('Password is required')
    if (!req.body.first_name) throw new Error('First name is required')
    if (!req.body.last_name) throw new Error('Last name is required')
    if (!req.body.profile_pic) throw new Error('Picture is required')
    if (req.body.password.length < 6)
      throw new Error('Password must be at least 6 characters')

    // Check for duplicate email
    const userExists = await db.query(
      `SELECT * FROM users WHERE email = '$1'`, // Use parameterized query to prevent SQL injection
      [req.body.email] // Pass email as a parameter
    )

    if (userExists.rows.length) throw new Error('User already exists')

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    //     // Create the user
    //     const queryString = `INSERT INTO users (first_name, last_name, email, password, profile_pic)
    // VALUES ($1, $2, $3, $4, $5)
    // RETURNING user_id, email`

    //     const values = [
    //       req.body.first_name,
    //       req.body.last_name,
    //       req.body.email,
    //       hashedPassword,
    //       req.body.profile_pic
    //     ]

    // let user = (await db.query(queryString, values)).rows[0]

    // Save user
    const { rows } = await db.query(`
      INSERT INTO users (first_name, last_name, email, password, profile_pic)
      VALUES ('${req.body.first_name}', '${req.body.last_name}', '${req.body.email}', '${hashedPassword}', '${req.body.profile_pic}')
      RETURNING *
    `)
    let user = rows[0]

    // Creating the token
    const token = jwt.sign({ user_id: user.user_id }, jwtSecret)
    res.cookie('jwt', token)

    // Compose response
    delete user.password

    // Respond
    res.json(user)
  } catch (err) {
    res.json({ error: err.message })
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
