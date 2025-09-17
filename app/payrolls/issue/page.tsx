import auth from '@/lib/auth/auth'
import {LTLocation, LTPayroll} from '@/src/utils/types'
import db from '@/lib/database'
import PayrollIssuePage from '@/src/components/payrolls/issue/PayrollIssuePage'

export interface LTPayrollIssueData {
  take_by: LTPayroll['takeBy']
  dates: LTPayroll['dates']
  location: LTLocation['name']
  value: number
}

export default async function PayrollIssue() {
  const worker = await auth()

  const query = `select
    p.id,
    p.take_by,
    p.dates,
    w.balance,
    l.name as location,
    wp.value + coalesce(wp.bonuses, 0) as value,
    wp.issue_confirmed,
    w2.name as to_take_by
    from lt_arena.payrolls p
    left join lt_arena.workers_payrolls wp on wp.worker_id = ${worker.id} and wp.payroll_id = p.id
    left join lt_arena.locations l on l.id = wp.location_id
    left join lt_arena.workers w on w.id = ${worker.id}
    left join lt_arena.workers w2 on w2.id = wp.to_take_by
    where p.take_by < NOW()
    order by p.take_by desc
  `

  const result = await db.query(query)

  const data = result.rows.map(row => ({
    ...row,
    take_by: row.take_by.toISO(),
    dates: row.dates.toISO(),
  }))

  const workersQuery = `select
  w.name,
  w.rank,
  w.id
  from lt_arena.workers w
  left join lt_arena.ranks r on r.name = w.rank
  order by r.sorting_weight desc, w.name`

  const takeByQuery = `select
  to_take,
  w.name,
  w.id,
  wp.payroll_id,
  wp.location_id
  from lt_arena.workers_payrolls wp
  left join lt_arena.workers w on w.id = wp.worker_id
  where wp.to_take_by = ${worker.id} and (wp.taken = 0 or wp.taken is null)
  `

  const workersResult = await db.query(workersQuery)
  const workers = workersResult.rows

  const takeByResult = await db.query(takeByQuery)
  const takeByData = takeByResult.rows

  return (
    <PayrollIssuePage
      payrolls={data}
      workers={workers}
      takeByData={takeByData}
    />
  )
}
