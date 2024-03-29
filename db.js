// db.js
import pg from 'pg'
// import { DBURL } from './secrets.js'

const { Pool } = pg

const DBURL = process.env.DATABASE_CONNECTION

// Database connection parameters

const db = new Pool({
  ssl: {
    rejectUnauthorized: false
  },
  connectionString: DBURL
})

export default db
