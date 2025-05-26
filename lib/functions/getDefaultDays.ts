import db from '../database'
import {DateTime, Interval} from 'luxon'

export default async function getDefaultDays() {
  const datesResult = await db.query(
    'SELECT start_date, end_date FROM lt_arena.dates WHERE id = 2',
  )

  const {start_date, end_date}: {start_date: DateTime; end_date: DateTime} =
    datesResult.rows[0]
  const interval = Interval.fromDateTimes(start_date, end_date)

  const dates = []

  for (let i = 1; i <= interval.length(); i++) {
    dates.push(start_date.plus({day: 1}))
  }

  return dates
}
