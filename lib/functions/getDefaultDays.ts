import db from '../database'
import {DateTime, Interval} from 'luxon'

export default async function getDefaultDays() {
  const datesResult = await db.query(
    'SELECT start_date, end_date FROM config.dates WHERE id = 2',
  )

  const {start_date, end_date}: {start_date: DateTime; end_date: DateTime} =
    datesResult.rows[0]
  const interval = Interval.fromDateTimes(start_date, end_date)

  const days = interval.splitBy({day: 1}).map(date => date.start!)

  days.push(interval.end!)
  return days
}
