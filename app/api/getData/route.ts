import db from '@/lib/database'
import {NextResponse} from 'next/server'
import getDefaultDays from '@/lib/functions/getDefaultDays'
import {DateTime} from 'luxon'
import createAdminSupabase from '@/lib/createAdminSupabase'
import auth from '@/lib/auth/auth'

export async function GET() {
  const supabase = await createAdminSupabase()

  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Пользователь не найден'}, {status: 500})
  }

  const telegramId = user.user_metadata.telegram_id

  if (!telegramId) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const worker = await auth()

  const dataQuery = `SELECT
  w.name,
  w.id AS worker_id,
  s.date,
  s.value,
  s.comment
  FROM lt_arena.schedule s
  LEFT JOIN lt_arena.workers w ON telegram_id = ${telegramId}
  LEFT JOIN lt_arena.dates dates ON dates.id = 2
  WHERE s.worker_id = w.id AND s.date BETWEEN dates.start_date AND dates.end_date`

  const dataResult = await db.query(dataQuery)
  if (!worker?.name)
    return NextResponse.json({message: 'Сотрудник не найден'}, {status: 404})

  const locationsQuery = `SELECT
  l.name AS location,
  w.name AS worker,
  w.rank,
  start_time,
  end_time,
  ls.date,
  ls.comment AS location_comment
  FROM lt_arena.locations_schedule ls
  LEFT JOIN lt_arena.locations l ON l.id = ls.location_id
  LEFT JOIN lt_arena.workers w ON w.id = ls.worker_id
  LEFT JOIN lt_arena.dates dates ON dates.id = 2
  WHERE
  (ls.date BETWEEN dates.start_date AND dates.end_date)
  AND ls.location_id IN (SELECT
  location_id FROM lt_arena.locations_schedule
  WHERE worker_id = ${worker.id}
  AND date = ls.date)`

  let locationsData: {
    rows: {
      date: DateTime
      start_time: string
      end_time: string
      location_comment: string
      worker: string
      rank: string
      location: string
    }[]
  } = {rows: []}

  locationsData = await db.query(locationsQuery)

  const defaultDays = await getDefaultDays()
  const workingDays = defaultDays.map(day => {
    const data = dataResult.rows.find(
      obj => obj.date.toFormat('yyyy-dd-MM') === day.toFormat('yyyy-dd-MM'),
    )

    if (!data)
      return {
        date: day,
        value: '',
      }

    const locationData = locationsData.rows
      .filter(
        obj => obj?.date.toFormat('yyyy-dd-MM') === day.toFormat('yyyy-dd-MM'),
      )
      ?.map(data => {
        let startTime = data.start_time
        let endTime = data.end_time

        if (!startTime) {
          startTime = '?'
        } else {
          startTime = startTime.slice(0, -3)
        }

        if (!endTime) {
          endTime = '?'
        } else {
          endTime = endTime.slice(0, -3)
        }

        const time =
          startTime === '?' && endTime === '?'
            ? 'Не указано'
            : `${startTime}-${endTime}`

        return {
          data: {
            time,
            role: data.location_comment,
            worker: data.worker,
            rank: data.rank,
          },
          self: worker.name === data.worker,
          locationName: data.location,
        }
      })

    return {
      date: day.toISO(),
      value: data.value,
      comment: data.comment,
      locationData,
    }
  })

  return NextResponse.json({workingDays, worker})
}
