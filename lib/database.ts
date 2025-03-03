import {Pool} from 'pg'

// @ts-ignore
let db: Pool = global.pg

if (!db) {
  // @ts-ignore
  db = global.pg = new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_URL,
    port: 5432,
  })
}

export default db
