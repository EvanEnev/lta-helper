import db from '@/lib/database'
import Table from '@/src/components/salary/Table'
import {SalaryData, UserSalary, Worker} from '@/src/utils/types'
import convertTZ from '@/lib/functions/convertTZ'
import sortByRank from '@/lib/functions/sortByRank'
import checkPermissions from '@/lib/functions/checkPermissions'
import {DateTime} from 'luxon'
import createAdminSupabase from '@/lib/createAdminSupabase'
import {redirect} from 'next/navigation'

export default async function Salary() {
  const supabase = await createAdminSupabase()

  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user) {
    redirect('/')
  }

  const telegramId = user?.user_metadata.telegram_id

  const date = convertTZ(new Date(), 'Europe/Moscow').toFormat('dd.MM')

  const query = `SELECT
                   w.name,
                   w.id,
                   rank,
                   l.name as location,
                   ranks.permission_level,
                   first_name,
                   last_name,
                   middle_name,
                   phone_number,
                   email,
                   photo_url,
                   admins.location_id as today_location
                 FROM lt_arena.workers w
                        LEFT JOIN lt_arena.ranks ranks ON ranks.name = w.rank
                        LEFT JOIN lt_arena.locations l ON l.id = w.location_id
                        LEFT JOIN lt_arena.admins admins ON admins.worker_id=w.id AND admins.date='${date}'
                 WHERE telegram_id = ${telegramId}`

  const permissionsQuery = `SELECT
        pm.name, description, pm.id
    FROM lt_arena.permissions pm
           LEFT JOIN lt_arena.workers w ON telegram_id=${telegramId}
           LEFT JOIN lt_arena.default_permissions dp ON (SELECT weight FROM lt_arena.ranks WHERE id = dp.rank_id) <= (SELECT weight FROM lt_arena.ranks WHERE name = w.rank)
           LEFT JOIN lt_arena.workers_permissions w_pm ON w_pm.worker_id = w.id AND COALESCE(w_pm.expires < NOW(), true)
    WHERE
      pm.id = dp.permission_id
       OR pm.id = w_pm.permission_id`

  const result = await db.query(query)
  const permissionsResult = await db.query(permissionsQuery)
  const permissions = permissionsResult.rows
  const worker = result.rows[0] || {}

  worker.permissions = permissions

  if (worker?.today_location) {
    worker.permission_level = 4
  }

  const canView = checkPermissions(['view_salary'], worker)
  const canViewLocation = checkPermissions(['view_location_salary'], worker)
  const canViewFull = checkPermissions(['view_full_salary'], worker)
  const canEdit = checkPermissions(['edit_salary'], worker)

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
    let queryAddon = `WHERE s.worker_id = (SELECT id FROM lt_arena.workers WHERE LOWER(name) = '${worker.name.toLowerCase()}')`

    if (canViewLocation) {
      queryAddon = `WHERE s.location_id = (SELECT location_id FROM lt_arena.workers WHERE LOWER(name) = '${worker.name.toLowerCase()}')`
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
                                  ${!(canViewFull || canViewLocation) ? `WHERE LOWER(name) = '${worker.name.toLowerCase()}'` : ''}`

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
