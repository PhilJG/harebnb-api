// db.js
import pg from 'pg'
// import { DBURL } from './secrets.js'
import 'dotenv/config'

const { Pool } = pg

// Database connection parameters

const db = new Pool({
  ssl: {
    rejectUnauthorized: false
  },
  connectionString: process.env.DATABASE_CONNECTION
})

export default db
