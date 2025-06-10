import {NextRequest, NextResponse} from 'next/server'
import auth from '@/lib/auth'
import {DateTime} from 'luxon'
import db from '@/lib/database'
import {WorkerSalary} from '@/src/utils/types'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const date = DateTime.fromISO(body.date).setZone('Europe/Moscow')

  const user = await auth()
  if (!user.id)
    return NextResponse.json({message: 'Пользователь не найден'}, {status: 500})

  let locationId = user.locationId

  const adminsQuery = `SELECT location_id
    FROM lt_arena.admins
    WHERE date = '${date.toFormat('dd.MM')}'
    AND worker_id = ${user.id}`

  const adminsResult = await db.query(adminsQuery)
  const adminsRows = adminsResult.rows

  if (adminsRows.length) {
    locationId = adminsRows[0].location_id
  }

  const query = `SELECT
  w.name AS worker,
  w.rank,
  l.name AS location,
  start_time,
  end_time,
  bonuses,
  comment,
  fines,
  overwork_start,
  overwork_end,
  overwork,
  value,
  date
  FROM lt_arena.salary s
  LEFT JOIN lt_arena.locations l ON s.location_id = l.id
  LEFT JOIN lt_arena.workers w ON s.worker_id = w.id
  WHERE s.location_id = ${locationId} AND s.date = '${date.toFormat('yyyy-MM-dd')}'`

  const result = await db.query(query)
  const rows = result.rows

  const data: WorkerSalary[] = rows.map(row => {
    const workingHours = row.overwork_end
      ? `${row.start_time.slice(0, -6)}-${row.overwork_end.slice(0, -6)}`
      : `${row.start_time.slice(0, -6)}-${row.end_time.slice(0, -6)}`

    const isHardTime =
      parseInt(row.end_time.slice(0, -6)) -
        parseInt(row.start_time.slice(0, -6)) ===
      8

    let gamesCount = 1

    if (row.rank === 'Актёр' && row.overwork) {
      gamesCount = 1 + parseInt(row.overwork) / 500
    }

    return {
      worker: row.worker,
      workingHours,
      location: row.location,
      value: row.value,
      comment: row.comment,
      bonuses: row.bonuses,
      fines: row.fines,
      isHardTime,
      gamesCount,
    }
  })

  return NextResponse.json({data})
}
