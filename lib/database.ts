import {Pool} from 'pg'

const db = new Pool({
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_URL,
  port: 5432,
})

export default db
