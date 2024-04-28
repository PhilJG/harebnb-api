import { Router } from 'express'
import db from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const router = Router()

router.post('/signup', async (req, res) => {
  try {
    // Required fields
    if (!req.body.email) {
      throw new Error('email is required')
    }
    if (!req.body.password) {
      throw new Error('password is required')
    }
    if (!req.body.profile_pic) {
      throw new Error('profile_pic is required')
    }
    if (!req.body.first_name) {
      throw new Error('first_name is required')
    }
    if (!req.body.last_name) {
      throw new Error('last_name is required')
    }
    // Other validation
    if (req.body.password.length < 6) {
      throw new Error('password must be minimum 6 characters long')
    }
    // Check duplicate user by email
    const userExists = await db.query(`
      SELECT * FROM users WHERE email = '${req.body.email}'
    `)
    if (userExists.rows.length) {
      throw new Error('User with this email already exists!')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    // Save user
    const { rows } = await db.query(`
      INSERT INTO users (first_name, last_name, email, password, profile_pic)
      VALUES ('${req.body.first_name}', '${req.body.last_name}', '${req.body.email}', '${hashedPassword}', '${req.body.profile_pic}')
      RETURNING *
    `)
    let user = rows[0]
    // Create token
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET)
    res.cookie('jwt', token)

    // Compose response
    delete user.password

    // Respond
  } catch (err) {
    res.json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  const { password, email } = req.body

  let dbpassword = `SELECT * FROM users WHERE users.email = '${email}'`

  try {
    let { rows } = await db.query(dbpassword)

    const isPswValid = await bcrypt.compare(password, rows[0].password)

    if (rows.length === 0) {
      throw new Error('User not found incorrect')
    }

    if (isPswValid) {
      let payload = {
        email: rows[0].email,
        user_id: rows[0].user_id
      }

      let token = jwt.sign(payload, process.env.JWT_SECRET)

      res.cookie('jwt', token)

      res.json(`${rows[0].last_name} you are logged in`)
    }
  } catch (err) {
    console.log(err)

    res.json({ error: err })
  }
})

router.get('/logout', (req, res) => {
  try {
    res.clearCookie('jwt', {
      secure: true,
      sameSite: 'none'
    })

    res.json({ message: 'You are logged out' })
  } catch (err) {
    res.json({ error: err.message })
  }
})

router.get('/profile', async (req, res) => {
  try {
    // Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET)

    if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    const { rows: userRows } = await db.query(`
      SELECT user_id, first_name, last_name, profile_pic, email
      FROM users WHERE user_id = ${decodedToken.user_id}
    `)

    res.json(userRows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

router.patch('/profile', async (req, res) => {
  try {
    // Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET)
    if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    // Validate fields
    if (
      !req.body.first_name &&
      !req.body.last_name &&
      !req.body.profile_pic &&
      !req.body.email
    ) {
      throw new Error('at least 1 field must be modified')
    }
    // Update user
    let query = `UPDATE users SET `
    if (req.body.first_name) {
      query += `first_name = '${req.body.first_name}', `
    }
    if (req.body.last_name) {
      query += `last_name = '${req.body.last_name}', `
    }
    if (req.body.email) {
      query += `email = '${req.body.email}', `
    }
    if (req.body.profile_pic) {
      query += `profile_pic = '${req.body.profile_pic}', `
    }
    query = query.slice(0, -2)
    query += `WHERE user_id = ${decodedToken.user_id} RETURNING profile_pic, first_name, last_name, email, user_id`
    const { rows: userRows } = await db.query(query)
    // Respond
    res.json(userRows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
