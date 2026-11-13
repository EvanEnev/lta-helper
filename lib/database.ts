import {Pool, types} from 'pg'
import {DateTime, Interval} from 'luxon'
import {isDemo} from '@/lib/demo'
import {demoDb} from '@/lib/demo/db'

types.setTypeParser(1082, (val: string) =>
  DateTime.fromISO(val, {zone: 'Europe/Moscow'}),
)

types.setTypeParser(1114, (val: string) =>
  DateTime.fromSQL(val, {zone: 'Europe/Moscow'}),
)

// @ts-ignore
types.setTypeParser(3912, (val: string) => {
  if (val === 'empty') return null

  const isoRange = val.slice(1, -1).replace(',', '/')

  return Interval.fromISO(isoRange).set({
    end: Interval.fromISO(isoRange).end?.minus({days: 1}),
  })
})

const db = isDemo
  ? demoDb
  : new Pool({
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_URL,
      port: parseInt(process.env.DATABASE_PORT!),
      database: process.env.DATABASE_NAME,
    })

export default db
