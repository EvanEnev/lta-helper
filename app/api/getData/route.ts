import conn from '@/lib/database'
import validateData from '@/lib/validateData'
import {Worker} from '@/src/utils/types'
import {NextRequest, NextResponse} from 'next/server'
import getDefaultDays from '@/lib/getDefaultDays'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const initData: string | undefined = body?.initData

  const user = await validateData(initData)
  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const telegramId = user.id

  const dataQuery = `SELECT
  workers.name,
  workers.rank,
  workers.location_id,
  ranks.permission_level,
  schedule.date,
  schedule.comment,
  schedule.value,
  locationsData.name AS worker_location,
  locations.name AS location,
  locations.id AS location_id
  FROM lt_arena.workers workers
  LEFT JOIN lt_arena.ranks ranks ON ranks.name=workers.rank
  LEFT JOIN lt_arena.schedule schedule ON schedule.worker_id=workers.id
  LEFT JOIN lt_arena.locations locations ON locations.id=schedule.location_id
  LEFT JOIN lt_arena.locations locationsData ON locationsData.id=workers.location_id
  WHERE workers.telegram_id=${telegramId}`

  const dataResult = await conn.query(dataQuery)
  if (!dataResult.rows.length || !dataResult.rows[0].name)
    return NextResponse.json({message: 'Сотрудник не найден'}, {status: 404})

  const workerData = {
    name: dataResult.rows[0].name,
    rank: dataResult.rows[0].rank,
    permission_level: dataResult.rows[0].permission_level,
    location: dataResult.rows[0].worker_location || '',
  }

  const locations = new Set(
    dataResult.rows.map(data => {
      if (data.date && data.location_id)
        return {date: data.date, locationId: data.location_id}
    }),
  )

  const locationsCondition = [...locations]
    .filter(v => v)
    .map(data => {
      if (data)
        return `(schedule.location_id=${data.locationId} AND schedule.date='${data.date}')`
    })
    .join(' OR ')

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
    role,
    start_time,
    end_time,
    date,
    w.rank,
    l.name AS location_name
    FROM lt_arena.schedule schedule
    LEFT JOIN lt_arena.workers w ON w.id = schedule.worker_id
    LEFT JOIN lt_arena.locations l ON l.id = schedule.location_id
    WHERE ${locationsCondition}`

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

        const time = `${startTime}-${endTime}`

        return {
          data: {
            time,
            role: data.role,
            worker: data.name,
            rank: data.rank,
          },
          self: workerData.name === data.name,
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

  let worker: Worker = {
    name: workerData?.name,
    workingDays,
    location: workerData.location,
    type: workerData.rank ? 'worker' : 'actor',
    comments: [],
    isAdmin: workerData.permission_level === 4,
  }

  return NextResponse.json(worker)
}
