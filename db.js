// db.js
import pg from 'pg'

const { Pool } = pg

const DBURL = process.env.DATABASE_CONNECTION

// Database connection parameters

const db = new Pool({
  user: `${process.env.DBUSER}`,
  host: `${process.env.HOST}`,
  database: `${process.env.DATABASE}`,
  password: `${process.env.DATABASE_PASSWORD}`,
  ssl: {
    rejectUnauthorized: false
  }
})

export default db
