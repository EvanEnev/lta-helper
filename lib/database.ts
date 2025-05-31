import {Pool} from 'pg'

const db = new Pool({
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_URL,
  port: parseInt(process.env.DATABASE_PORT!),
})

export default db
