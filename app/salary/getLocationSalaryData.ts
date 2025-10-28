import checkPermissions from '@/lib/functions/checkPermissions'
import convertTZ from '@/lib/functions/convertTZ'
import db from '@/lib/database'
import {LTWorker, SalaryData, UserSalary, Filter} from '@/src/utils/types'
import sortByRank from '@/lib/functions/sortByRank'
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
  let salaryResult = {rows: []}

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

    const salaryQuery = `SELECT date,
                                    value,
                                    bonuses,
                                    fines,
                                    comment,
                                    created_at,
                                    start_time,
                                    end_time,
                                    overwork_start,
                                    overwork_end,
                                    overwork,
                                    w.name  AS worker_name,
                                    w.id AS worker_id,
                                    ws.name AS created_by,
                                    l.name  AS location_name,
                                    l.color AS location_color,
                                    l.id AS location_id,
                                    s.type,
                                    s.one_games,
                                    s.two_games,
                                    s.three_games,
                                    s.actor_games,
                                    s.work_types
                             FROM lt_arena.salary s
                                      LEFT JOIN lt_arena.workers w ON w.id = s.worker_id
                                      LEFT JOIN lt_arena.workers ws ON ws.id = s.created_by
                                      LEFT JOIN lt_arena.locations l ON l.id = s.location_id
                         WHERE date BETWEEN '${currentDate.startOf('month').toFormat('yyyy-MM-dd')}' AND '${currentDate.endOf('month').toFormat('yyyy-MM-dd')}'
                                 ${queryAddon}`

    let workersQueryAddon = `${!(canViewFull || canViewLocation) ? `WHERE LOWER(name) = '${worker?.name.toLowerCase()}'` : ''}`

    const workersQuery = `
    SELECT
    id, name, first_name, rank, telegram_id, is_former
    FROM lt_arena.workers 
    ${workersQueryAddon}`

    const results = await db.query(`${salaryQuery};\n${workersQuery}`)

    // @ts-ignore
    const workersResult = results[1]
    // @ts-ignore
    salaryResult = results[0]

    workersRows = workersResult.rows
  }

  const workers: Omit<LTWorker, 'permissions' | 'permissionLevel'>[] =
    workersRows.map((row: any) => {
      return {
        id: row.id,
        name: row.name,
        telegramId: row.telegram_id,
        rank: row.rank,
        firstName: row.first_name,
        isFormer: row.is_former,
      }
    })

  const sortedWorkers = sortByRank(workers)

  const salaryData: SalaryData[] = salaryResult.rows?.map((row: any) => {
    const date: DateTime = row.date.set({second: 0, minute: 0, hour: 0})
    return {
      date: date.toFormat('yyyy-MM-dd'),
      value: row.value,
      bonuses: row.bonuses,
      fines: row.fines,
      comment: row.comment,
      created_at: row.created_at || '',
      created_by: row.created_by,
      worker_name: row.worker_name,
      worker_id: row.worker_id,
      start_time: row.start_time,
      end_time: row.end_time,
      overwork_start: row.overwork_start,
      overwork_end: row.overwork_end,
      overwork: row.overwork,
      location: {
        name: row.location_name,
        color: row.location_color,
        id: row.location_id,
      },
      type: row.type,
      oneGames: row.one_games,
      twoGames: row.two_games,
      threeGames: row.three_games,
      actorGames: row.actor_games,
      workTypes: row.work_types,
    }
  })

  return sortedWorkers.map(worker => {
    const rowWithDates: UserSalary = {
      user: {
        id: worker.id,
        name: worker.name,
        firstName: worker.firstName || null,
        rank: worker.rank,
        isFormer: worker.isFormer || null,
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

      if (!salary) {
        rowWithDates[`day${day}`] = ''
      } else {
        rowWithDates[`day${day}`] = {...salary, date: date.toISO() || ''}
      }
    }

    return rowWithDates
  })
}
