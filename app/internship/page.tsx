import {redirect} from 'next/navigation'
import {headers} from 'next/headers'
import db from '@/lib/database'
import {auth} from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import InternshipPage from '@/src/components/internship/InternshipPage'
import type {InternshipRow} from '@/src/components/internship/types'

export const dynamic = 'force-dynamic'

export default async function Internship() {
  const worker = (await auth.api.getSession({headers: await headers()}))?.user

  if (!worker) redirect('/login')
  if (!checkPermissions(['manage_internship'], worker)) redirect('/')

  const query = `
    select i.worker_id                         as "workerId",
           w.name                              as "workerName",
           i.id                                as "internshipId",
           c.name                              as curator,
           i.curator_id                        as "curatorId",
           i.planned_days                      as "plannedDays",
           (select count(*)
            from internship.days d
            where d.internship_id = i.id)::int as "daysCount",
           to_char(i.started_at, 'YYYY-MM-DD') as "startedAt",
           i.closed_at::text                   as "closedAt",
           i.result
    from internship.list i
           join workers w on w.id = i.worker_id
           join workers c on c.id = i.curator_id
    order by "closedAt" desc nulls first, "workerName"`

  const rows: InternshipRow[] = (await db.query(query)).rows

  return <InternshipPage rows={rows} userId={worker.id} />
}
