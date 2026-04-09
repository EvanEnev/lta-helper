import {LTPayroll} from '@/src/utils/types'
import db from '@/lib/database'
import PayrollsPage from '@/src/components/payrolls/PayrollsPage'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'

export const dynamic = 'force-dynamic'

export default async function Payrolls() {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  const query = `select
  id,
  dates,
  take_by as "takeBy",
  created_at as "createdAt",
  functions.get_worker(created_by) as "createdBy",
  bonuses,
  is_published as "isPublished",
  meta,
  (select count(*) from relations.workers_payrolls where payroll_id = p.id) as "workersCount"
  from payrolls.list p
  ${checkPermissions(['edit_payrolls'], worker) ? '' : 'where p.is_published = true'}
  order by lower(dates) desc
  `

  const result = await db.query(query)

  const data: LTPayroll[] = result.rows.map(d => ({
    ...d,
    dates: d.dates.toISO(),
    createdAt: d.createdAt.toISO(),
    takeBy: d.takeBy.toISO(),
  }))

  return <PayrollsPage worker={worker} data={data} />
}
