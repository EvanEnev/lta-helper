import {NextRequest, NextResponse} from 'next/server'
import {DateTime} from 'luxon'
import db from '@/lib/database'
import {LTLocation, WorkerSalary} from '@/src/utils/types'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const date = DateTime.fromISO(body.date).setZone('Europe/Moscow')

  const {user} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!user?.id)
    return NextResponse.json({message: 'Пользователь не найден'}, {status: 500})

  let locationId = user.locationId

  const adminsQuery = `SELECT location_id
    FROM config.admins
    WHERE date::date = '${date.toFormat('yyyy-MM-dd')}'
    AND worker_id = ${user.id}
    order by date desc
    limit 1`

  const adminsResult = await db.query(adminsQuery)
  const adminsRows = adminsResult.rows

  if (adminsRows.length) {
    locationId = adminsRows[0].location_id
  }

  const locationQuery = `select get_location(${locationId}) as location;`
  const locationResult = await db.query(locationQuery)
  const location: LTLocation = locationResult.rows[0]?.location || {}

  const query = `SELECT
  w.name AS worker,
  w.id,
  r.name as rank,
  l.name AS location,
  created_at::text as "createdAt",
  start_time,
  end_time,
  bonuses,
  comment,
  fines,
  overwork_start,
  overwork_end,
  s.overwork,
  value,
  date,
  one_games,
  two_games,
  three_games,
  actor_games,
  work_types,
  r.sorting_weight,
  s.is_confirmed,
  s.task_id
  FROM salary.list s
  LEFT JOIN locations l ON s.location_id = l.id
  LEFT JOIN workers w ON s.worker_id = w.id
  left join ranks r on r.id = w.rank_id
  WHERE s.date = '${date.toFormat('yyyy-MM-dd')}' ${locationId ? `AND (s.location_id = ${locationId} OR s.location_id = 12${user.id === 42 || user.id === 12 ? ' or s.location_id = 17' : ''})` : ''}
  order by r.sorting_weight desc, w.name
  `

  const result = await db.query(query)
  const rows = result.rows

  let data: WorkerSalary[] = rows.map(row => {
    const workingHours = row.overwork_end
      ? `${row.start_time.slice(0, -6)}-${row.overwork_end.slice(0, -6)}`
      : `${row.start_time.slice(0, -6)}-${row.end_time.slice(0, -6)}`

    const isHardTime =
      parseInt(row.end_time.slice(0, -6)) -
        parseInt(row.start_time.slice(0, -6)) <=
      8

    let gamesCount = 1

    if (row.rank === 'Актёр' && row.overwork) {
      gamesCount = 1 + parseInt(row.overwork) / 500
    }

    return {
      worker: row.worker,
      workerId: row.id,
      createdAt: row.createdAt,
      workingHours,
      location: row.location,
      value: row.value,
      comment: row.comment,
      bonuses: row.bonuses,
      fines: row.fines,
      isHardTime,
      gamesCount,
      oneGames: row.one_games,
      twoGames: row.two_games,
      threeGames: row.three_games,
      actorGames: row.actor_games,
      workTypes: row.work_types,
      sorting_weight: row.sorting_weight || 0,
      isConfirmed: row.is_confirmed,
      taskId: row.task_id,
    }
  })

  const faceIdQuery = `select
                     w.id as "workerId",
                     w.name,
                     r.name as rank,
                     r.sorting_weight,
                     json_agg(
                       json_build_object(
                         'location', functions.get_location(fd.location_id),
                         'date', date::text
                       )
                     ) as data
                   from face_id fd
                   left join workers w on w.id = fd.worker_id
                   left join ranks r on r.id = w.rank_id
                   where (date between '${date.toFormat('yyyy-MM-dd')}'::date + interval '5 hours' and '${date.toFormat('yyyy-MM-dd')}'::date + interval '29 hours') and (fd.location_id = ${locationId} OR fd.location_id = 12${user.id === 42 || user.id === 12 ? ' or fd.location_id = 17' : ''})
                   group by w.id, r.sorting_weight, r.name`

  const faceIdResult = await db.query(faceIdQuery)
  const faceIdRows = faceIdResult.rows

  faceIdRows.forEach(row => {
    const currentData = data.find(d => d.worker === row.name)

    if (!currentData) {
      const workTypes = []

      if (row.rank === 'Актёр') {
        workTypes.push(7)
      } else if (['Платиновый', 'Золотой'].includes(row.rank)) {
        workTypes.push(8)
      } else if (row.rank === 'ОП') {
        workTypes.push(9)
      } else {
        workTypes.push(3)
      }

      let workingHours = ''

      if (row.data.length && row.data[0].date) {
        let date = DateTime.fromFormat(row.data[0].date, 'yyyy-MM-dd HH:mm:ss')

        if (date.minute > 30) {
          date = date.plus({hours: 1})
        }

        workingHours = `${date.hour > 9 ? date.hour : `${0}${date.hour}`}-${
          date.plus({hours: row.rank === 'Актёр' ? 4 : 9}).hour
            ? date.plus({hours: row.rank === 'Актёр' ? 4 : 9}).hour
            : `${0}${date.plus({hours: row.rank === 'Актёр' ? 4 : 9}).hour}`
        }`
      }

      data.push({
        worker: row.name,
        workingHours: workingHours,
        location: location.name,
        createdAt: null,
        value: 0,
        comment: '',
        bonuses: '',
        fines: '',
        isHardTime: false,
        gamesCount: 0,
        oneGames: null,
        twoGames: null,
        threeGames: null,
        actorGames: null,
        workTypes: workTypes,
        sorting_weight: row.sorting_weight || 0,
        isConfirmed: false,
        taskId: null,
      })
    }
  })

  data = data.sort((a, b) => {
    if (a.sorting_weight === b.sorting_weight) {
      return a.worker.localeCompare(b.worker)
    }

    return (
      b.sorting_weight - a.sorting_weight || a.worker.localeCompare(b.worker)
    )
  })

  return NextResponse.json({data, faceId: faceIdRows})
}
