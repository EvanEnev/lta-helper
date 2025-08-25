import {LTPayroll} from '@/src/utils/types'
import db from '@/lib/database'
import PayrollsPage from '@/src/components/payrolls/PayrollsPage'

export default async function Payrolls() {
  const query = `select
  id,
  dates,
  take_by as "takeBy",
  created_at as "createdAt",
  get_worker(created_by) as "createdBy",
  bonuses,
  (select count(*) from lt_arena.workers_payrolls where payroll_id = p.id) as "workersCount"
  from lt_arena.payrolls p
  order by lower(dates)
  `

  const result = await db.query(query)

  const data: LTPayroll[] = result.rows.map(d => ({
    ...d,
    dates: d.dates.toISO(),
    createdAt: d.createdAt.toISO(),
    takeBy: d.takeBy.toISO(),
  }))

  console.debug(data)

  return <PayrollsPage data={data} />
}
