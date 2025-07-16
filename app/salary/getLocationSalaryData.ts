import auth from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import convertTZ from '@/lib/functions/convertTZ'
import db from '@/lib/database'
import {LTWorker, SalaryData, UserSalary} from '@/src/utils/types'
import sortByRank from '@/lib/functions/sortByRank'
import {DateTime} from 'luxon'

export default async function getLocationSalaryData({
  locationId = 2,
  date,
}: {
  locationId?: number
  date: string
}) {
  const worker = await auth()

  const canView = checkPermissions(['view_salary'], worker)
  const canViewLocation = checkPermissions(['view_location_salary'], worker)
  const canViewFull = checkPermissions(['view_full_salary'], worker)

  const currentDate = DateTime.fromFormat(date, 'yyyy-MM-dd')

  const currentYear = currentDate.year
  const currentMonth = currentDate.month - 1
  const daysInMonth = currentDate.daysInMonth || 1

  let workersRows = []
  let salaryResult = {rows: []}

  if (canView) {
    let queryAddon = `AND s.worker_id = ${worker.id}`

    if (canViewLocation) {
      queryAddon += ` OR s.location_id = ${worker.locationId}`
    }

    if (canViewFull) {
      queryAddon = `AND s.location_id = ${locationId}`
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
                                    s.type
                             FROM lt_arena.salary s
                                      LEFT JOIN lt_arena.workers w ON w.id = s.worker_id
                                      LEFT JOIN lt_arena.workers ws ON ws.id = s.created_by
                                      LEFT JOIN lt_arena.locations l ON l.id = s.location_id
                         WHERE date BETWEEN '${currentDate.startOf('month').toFormat('yyyy-MM-dd')}' AND '${currentDate.endOf('month').toFormat('yyyy-MM-dd')}'
                                 ${queryAddon}`

    const workersQuery = `
    SELECT
    id, name, first_name, rank, telegram_id, is_former
    FROM lt_arena.workers 
    ${!(canViewFull || canViewLocation) ? `WHERE LOWER(name) = '${worker.name.toLowerCase()}'` : ''}`

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
    const createdAt: DateTime = convertTZ(row.created_at, 'Europe/Moscow')
    console.debug(row)
    return {
      date: date.toFormat('yyyy-MM-dd'),
      value: row.value,
      bonuses: row.bonuses,
      fines: row.fines,
      comment: row.comment,
      created_at: createdAt.toISO() || '',
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
