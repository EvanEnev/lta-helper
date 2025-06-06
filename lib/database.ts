import {Pool, types} from 'pg'
import convertTZ from '@/lib/functions/convertTZ'

types.setTypeParser(1082, (val: string) => {
  return convertTZ(new Date(val), 'Europe/Moscow')
})

const db = new Pool({
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_URL,
  port: parseInt(process.env.DATABASE_PORT!),
})

export default db
