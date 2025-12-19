import checkPermissions from '@/lib/functions/checkPermissions'
import convertTZ from '@/lib/functions/convertTZ'
import db from '@/lib/database'
import {SalaryData, UserSalary, Filter} from '@/src/utils/types'
import {DateTime} from 'luxon'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

interface GetLocationSalaryDataProps {
  locationId?: number
  date: string | Set<string>
  allLocations?: boolean
  filters?: Filter[]
}

export default async function getLocationSalaryData({
  locationId,
  date,
  allLocations = false,
  filters = [],
}: GetLocationSalaryDataProps) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  const canView = checkPermissions(['view_salary'], worker)
  const canViewLocation = checkPermissions(['view_location_salary'], worker)
  const canViewFull = checkPermissions(['view_full_salary'], worker)

  if (typeof date === 'object') {
    date = Array.from(date)[0]
  }

  const currentDate = DateTime.fromFormat(date, 'yyyy-MM-dd')

  const currentYear = currentDate.year
  const currentMonth = currentDate.month - 1
  const daysInMonth = currentDate.daysInMonth || 1

  let workersRows = []
  let faceIdRows = []
  let salaryResult = {rows: []}
  let paymentsRows = []

  if (canView) {
    let queryAddon = ''

    if (!allLocations) {
      queryAddon = `AND s.worker_id = ${worker?.id}`
    }

    if (canViewLocation && !allLocations) {
      queryAddon = `AND s.worker_id = ${worker?.id} OR s.location_id = ${locationId || worker?.locationId}`
    }

    if (canViewFull && !allLocations) {
      queryAddon = `AND s.location_id = ${locationId || 2}`
    }

    if (filters?.length) {
      filters.forEach(filter => {
        if (typeof filter.value === 'number') {
          queryAddon += ` AND ${filter.key} = ${filter.value}`
        } else {
          queryAddon += ` AND ${filter.key} ILIKE '${filter.value}%'`
        }
      })
    }

    const salaryQuery = `SELECT date::text,
                                    value,
                                    bonuses,
                                    fines,
                                    comment,
                                    created_at::text,
                                    start_time,
                                    end_time,
                                    overwork_start,
                                    overwork_end,
                                    overwork,
                                    w.name  AS worker_name,
                                    w.id AS worker_id,
                                    ws.name AS created_by,
                                    get_location(l.id) AS location,
                                    s.type,
                                    s.one_games as "oneGames",
                                    s.two_games as "twoGames",
                                    s.three_games as "threeGames",
                                    s.actor_games as "actorGames",
                                    s.work_types
                             FROM lt_arena.salary s
                                      LEFT JOIN lt_arena.workers w ON w.id = s.worker_id
                                      LEFT JOIN lt_arena.workers ws ON ws.id = s.created_by
                                      LEFT JOIN lt_arena.locations l ON l.id = s.location_id
                         WHERE date BETWEEN '${currentDate.startOf('month').toFormat('yyyy-MM-dd')}' AND '${currentDate.endOf('month').toFormat('yyyy-MM-dd')}'
                                 ${queryAddon}`

    const paymentsQuery = `select
    worker_id,
    pt.name,
    p.value,
    date,
    comment,
    act_id
    from lt_arena.payments p
    left join lt_arena.payments_types pt on pt.id = p.payment_type`

    const workersQuery = `
    SELECT
    w.id, w.name, first_name as "firstName", rank, telegram_id as "telegramId", is_former as "isFormer"
    FROM lt_arena.workers w
    left join lt_arena.ranks r on r.name ilike w.rank
    ${!(canViewFull || canViewLocation) ? `where w.name ilike '${worker?.name}'` : ''}
    order by w.is_former desc, r.sorting_weight desc, w.name`

    const results = await db.query(
      `${salaryQuery};\n${workersQuery};\n${paymentsQuery}`,
    )

    // @ts-ignore
    const workersResult = results[1]
    // @ts-ignore
    salaryResult = results[0]
    // @ts-ignore
    const paymentsResult = results[2]
    paymentsRows = paymentsResult.rows

    console.debug(paymentsRows)

    workersRows = workersResult.rows

    const faceIdQuery = `select
                         worker_id as "workerId",
                         json_agg(
                           json_build_object(
                             'location', get_location(location_id),
                             'date', date::text
                           )
                         ) as data
                       from lt_arena.face_id
                       where extract(month from date) = ${DateTime.fromISO(date).month}
                       group by worker_id`

    const faceIdResult = await db.query(faceIdQuery)
    faceIdRows = faceIdResult.rows
  }

  const salaryData: SalaryData[] = salaryResult.rows

  const data = workersRows.map((worker: any) => {
    const rowWithDates: UserSalary = {
      user: {
        id: worker.id,
        name: worker.name,
        firstName: worker.firstName,
        rank: worker.rank,
        isFormer: worker.isFormer,
      },
      dates: [],
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = convertTZ(
        new Date(currentYear, currentMonth, day),
        'Europe/Moscow',
      )

      const salary: SalaryData | undefined = salaryData.find(
        s =>
          s.date === date.toFormat('yyyy-MM-dd') &&
          s.worker_name === worker.name,
      )

      const payment = paymentsRows.find(
        (p: any) =>
          p.worker_id === worker.id &&
          p.date.toFormat('yyyy-MM-dd') === date.toFormat('yyyy-MM-dd'),
      )

      let obj: string | SalaryData = ''

      if (!(salary || payment)) {
        obj = ''
      } else {
        // @ts-ignore
        obj = {
          ...salary,
          // @ts-ignore
          payment: payment
            ? {...payment, date: payment?.date.toISO() || ''}
            : null,
          date: date.toISO() || '',
        }
      }

      if (payment !== undefined) {
        console.debug(payment, obj)
      }

      rowWithDates[`day${day}`] = obj
    }

    return rowWithDates
  })

  return {data, faceId: faceIdRows}
}
