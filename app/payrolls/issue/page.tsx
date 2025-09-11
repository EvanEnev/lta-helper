import auth from '@/lib/auth/auth'
import {LTLocation, LTPayroll} from '@/src/utils/types'
import db from '@/lib/database'

export interface LTPayrollIssueData {
  take_by: LTPayroll['takeBy']
  dates: LTPayroll['dates']
  location: LTLocation['name']
  value: number
}

export default async function PayrollIssue() {
  const worker = await auth()

  const query = `select
    p.take_by,
    p.dates,
    l.name as location,
    wp.value + coalesce(wp.bonuses, 0)
    from lt_arena.payrolls p
    left join lt_arena.workers_payrolls wp on wp.worker_id = ${worker.id} and wp.payroll_id = p.id
    left join lt_arena.locations l on l.id = wp.location_id
  `

  const result = await db.query(query)
}
