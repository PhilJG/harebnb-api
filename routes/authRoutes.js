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
    console.log(newUser)
    // check if user email exists
    const queryResult = await db.query(`
    SELECT * FROM users
    WHERE email ='${newUser.email}'
    `)
    if (queryResult.rowCount) {
      throw new Error('Email already exists')
    }
    //hash the password
    const salt = await bcrypt.genSalt(9)
    const hashedPassword = await bcrypt.hash(newUser.password, salt)

    //create the user
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
    const insertion = await db.query(queryString, values)

    //creating the token
    let payload = {
      email: newUser.email,
      user_id: newUser.user_id
    }
    //Generate a token
    let token = jwt.sign(payload, jwtSecret)
    // creating the cookie
    res.cookie('jwt', token)
    res.json({ message: 'logged in' })
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
