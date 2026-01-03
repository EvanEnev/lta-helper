import db from '@/lib/database'
import {NextResponse} from 'next/server'
import getDefaultDays from '@/lib/functions/getDefaultDays'
import {DateTime} from 'luxon'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

export async function GET() {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return NextResponse.json({message: 'Пользователь не найден'}, {status: 500})
  }

  const telegramId = worker.telegramId

  if (!telegramId) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const dataQuery = `SELECT
  w.name,
  w.id AS worker_id,
  s.date,
  s.value,
  s.comment
  FROM schedule.list s
  LEFT JOIN workers w ON telegram_id = ${telegramId}
  LEFT JOIN config.dates dates ON dates.id = 2
  WHERE s.worker_id = w.id AND s.date BETWEEN dates.start_date AND dates.end_date`

  const dataResult = await db.query(dataQuery)
  if (!worker?.name)
    return NextResponse.json({message: 'Сотрудник не найден'}, {status: 404})

  const locationsQuery = `SELECT
  l.name AS location,
  w.name AS worker,
  r.name as rank,
  start_time,
  end_time,
  ls.date,
  ls.comment AS location_comment
  FROM schedule.locations_schedule ls
  LEFT JOIN locations l ON l.id = ls.location_id
  LEFT JOIN workers w ON w.id = ls.worker_id
  LEFT JOIN config.dates dates ON dates.id = 2
  left join ranks r on r.id = w.rank_id
  WHERE
  (ls.date BETWEEN dates.start_date AND dates.end_date)
  AND ls.location_id IN (SELECT
  location_id FROM schedule.locations_schedule
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
