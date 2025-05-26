import db from '@/lib/database'
import Table from '@/src/components/salary/Table'
import {SalaryData, UserSalary, Worker} from '@/src/utils/types'
import convertTZ from '@/lib/functions/convertTZ'
import sortByRank from '@/lib/functions/sortByRank'
import {auth} from '@/lib/auth'
import {Session} from 'next-auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import {DateTime} from 'luxon'

export default async function Salary() {
  const session = await auth()

  const user: Session['user'] = session?.user

  const canView = checkPermissions(['view_salary'], user)
  const canViewLocation = checkPermissions(['view_location_salary'], user)
  const canViewFull = checkPermissions(['view_full_salary'], user)
  const canEdit = checkPermissions(['edit_salary'], user)

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)

  let workersRows = []
  let salaryResult = {rows: []}

  if (canView) {
    let queryAddon = `WHERE s.worker_id = (SELECT id FROM lt_arena.workers WHERE LOWER(name) = '${user.name.toLowerCase()}')`

    if (canViewLocation) {
      queryAddon = `WHERE s.location_id = (SELECT location_id FROM lt_arena.workers WHERE LOWER(name) = '${user.name.toLowerCase()}')`
    }

    if (canViewFull) {
      queryAddon = ''
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
                                    l.color AS location_color
                             FROM lt_arena.salary s
                                      LEFT JOIN lt_arena.workers w ON w.id = s.worker_id
                                      LEFT JOIN lt_arena.workers ws ON ws.id = s.created_by
                                      LEFT JOIN lt_arena.locations l ON l.id = s.location_id
                                 ${queryAddon}`

    salaryResult = await db.query(salaryQuery)

    const workersQuery = `SELECT id, name, first_name, rank, telegram_id
                              FROM lt_arena.workers
                                  ${!(canViewFull || canViewLocation) ? `WHERE LOWER(name) = '${user.name.toLowerCase()}'` : ''}`

    const workersResult = await db.query(workersQuery)
    workersRows = workersResult.rows
  }

  const workers: Worker[] = workersRows.map(row => {
    return {
      id: row.id,
      name: row.name,
      telegramId: row.telegram_id,
      rank: row.rank,
      firstName: row.first_name,
    }
  })

  const sortedWorkers = sortByRank(workers)

  const salaryData: SalaryData[] = salaryResult.rows?.map((row: any) => {
    const date: DateTime = row.date.set({second: 0, minute: 0, hour: 0})
    const createdAt: DateTime = convertTZ(row.created_at, 'Europe/Moscow')

    return {
      date: date.toISO() || '',
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
      },
    }
  })

  const data = sortedWorkers.map((worker: Worker) => {
    const rowWithDates: UserSalary = {
      user: {
        id: worker.id,
        name: worker.name,
        firstName: worker.firstName || null,
        rank: worker.rank,
      },
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = convertTZ(
        new Date(currentYear, currentMonth, day),
        'Europe/Moscow',
      )

      const salary: SalaryData | undefined = salaryData.find(
        s => s.date === date.toISO() && s.worker_name === worker.name,
      )

      if (!salary) {
        rowWithDates[`day${day}`] = ''
      } else {
        rowWithDates[`day${day}`] = {...salary, date: date.toISO() || ''}
      }
    }

    return rowWithDates
  })

  return (
    <main className="h-fit">
      <Table data={data} canEdit={canEdit} />
    </main>
  )
}
