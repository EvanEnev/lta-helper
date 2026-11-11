import db from '@/lib/database'
import convertTZ from '@/lib/functions/convertTZ'
import type {Shift} from '@/src/components/page/shifts'

const cut = (time: string | null) => (time ? time.slice(0, -3) : '?')

export default async function getMonthShifts(workerId: number) {
  const today = convertTZ(new Date(), 'Europe/Moscow').startOf('day')

  const result = await db.query(
    `SELECT l.name AS location, ls.date, ls.start_time, ls.end_time, ls.comment
     FROM salary.list ls
            LEFT JOIN locations l ON l.id = ls.location_id
     WHERE ls.worker_id = $1 AND ls.date BETWEEN $2::date AND $3::date
     ORDER BY ls.date`,
    [
      workerId,
      today.startOf('month').toFormat('yyyy-MM-dd'),
      today.plus({month: 1}).endOf('month').toFormat('yyyy-MM-dd'),
    ],
  )

  return result.rows.map(row => {
    const start = cut(row.start_time)
    const end = cut(row.end_time)
    const date = row.date.startOf('day')

    return {
      date,
      locationName: row.location,
      time: start === '?' && end === '?' ? 'Не указано' : `${start}-${end}`,
      role: row.comment,
      daysLeft: Math.round(date.diff(today, 'days').days),
    } satisfies Shift
  })
}
