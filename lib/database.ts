import {Pool, types} from 'pg'
import convertTZ from '@/lib/functions/convertTZ'
import {Interval} from 'luxon'

types.setTypeParser(1082, (val: string) => {
  return convertTZ(new Date(val), 'Europe/Moscow')
})

types.setTypeParser(1114, (val: string) => {
  return convertTZ(new Date(val), 'Europe/Moscow')
})

// @ts-ignore
types.setTypeParser(3912, (val: string) => {
  if (val === 'empty') return null

  const isoRange = val.slice(1, -1).replace(',', '/')

  return Interval.fromISO(isoRange).set({
    end: Interval.fromISO(isoRange).end?.minus({days: 1}),
  })
})

const db = new Pool({
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_URL,
  port: parseInt(process.env.DATABASE_PORT!),
})

export default db
