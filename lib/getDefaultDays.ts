import google from '@/lib/google'
import conn from './database'

export default async function getDefaultDays() {
  const datesResult = await conn.query(
    'SELECT start_date, end_date FROM lt_arena.dates WHERE id = 2',
  )
  const {start_date: startDate, end_date: endDate} = datesResult.rows[0]

  let dates = []
  let currentDate = startDate

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}
