import convertTZ from '@/lib/convertTZ'
import conn from '@/lib/database'
import {NextResponse} from 'next/server'
import getDefaultDays from '@/lib/getDefaultDays'
import {auth} from '@/auth'

export async function GET() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const telegramId = user.id

  const dataQuery = `SELECT
  workers.name,
  workers.rank,
  workers.location_id,
  schedule.date,
  schedule.comment,
  schedule.value,
  locations.name AS location,
  locations.id AS location_id,
  FROM lt_arena.workers workers
  LEFT JOIN lt_arena.schedule schedule ON schedule.worker_id=workers.id
  LEFT JOIN lt_arena.locations locations ON locations.id=schedule.location_id
  WHERE workers.telegram_id=${telegramId}`

  const dataResult = await conn.query(dataQuery)
  if (!dataResult.rows.length || !dataResult.rows[0].name)
    return NextResponse.json({message: 'Сотрудник не найден'}, {status: 404})

  const locations = new Set(
    dataResult.rows.map(data => {
      if (data.date && data.location_id)
        return {date: data.date, locationId: data.location_id}
    }),
  )

  const locationsCondition = null

  let locationsData: {
    rows: {
      date: string
      start_time: string
      end_time: string
      role: string
      name: string
      rank: string
      location_name: string
    }[]
  } = {rows: []}

  if (locationsCondition) {
    const locationsDataQuery = `SELECT
    w.name,
    w.role,
    start_time,
    end_time,
    date,
    w.rank,
    l.name AS location_name
    FROM lt_arena.locations_schedule locations_schedule
    LEFT JOIN lt_arena.workers w ON w.id = locations_schedule.worker_id
    LEFT JOIN lt_arena.locations l ON l.id = locations_schedule.location_id`

    locationsData = await conn.query(locationsDataQuery)
  }

  const defaultDays = await getDefaultDays()
  const workingDays = defaultDays.map((day: string) => {
    const data = dataResult.rows.find(data => data.date === day)

    if (!data) {
      return {date: day, value: ''}
    }

    const locationData = locationsData.rows
      .filter(obj => obj?.date === day && obj.location_name === data.location)
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
            role: data.role,
            worker: data.name,
            rank: data.rank,
          },
          self: user.name === data.name,
          locationName: data.location_name,
        }
      })

    return {
      date: day,
      value: data.value,
      comment: data.comment,
      locationData,
      location: data.location,
    }
  })

  return NextResponse.json(workingDays)
}
