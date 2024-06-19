import {Pool} from 'pg'

// @ts-ignore
let conn: Pool = global.pg

if (!conn) {
  // @ts-ignore
  conn = global.pg = new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: 'silencecraft.ru',
    port: 5432,
  })
}

export default conn
