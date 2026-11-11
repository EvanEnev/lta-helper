import {notFound, redirect} from 'next/navigation'
import {headers} from 'next/headers'
import db from '@/lib/database'
import {auth} from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import {toId} from '@/lib/payrolls/validate'
import InternshipDetailPage from '@/src/components/internship/InternshipDetailPage'
import {getCurators} from '@/lib/internship/curators'
import type {InternshipDetails} from '@/src/components/internship/types'

export const dynamic = 'force-dynamic'

interface InternshipDetailsProps {
  params: Promise<{id: string}>
}

export default async function InternshipDetailsRoute({
  params,
}: InternshipDetailsProps) {
  const worker = (await auth.api.getSession({headers: await headers()}))?.user

  if (!worker) redirect('/login')
  if (!checkPermissions(['manage_internship'], worker)) redirect('/')

  const id = toId((await params).id)

  if (id === null) notFound()

  const query = `
    select i.id,
           i.worker_id                                  as "workerId",
           w.name                                       as "workerName",
           c.name                                       as curator,
           i.curator_id                                 as "curatorId",
           i.planned_days                               as "plannedDays",
           to_char(i.started_at, 'YYYY-MM-DD')          as "startedAt",
           i.closed_at::text                            as "closedAt",
           i.result,
           i.summary,
           coalesce(jsonb_agg(jsonb_build_object(
             'id', d.id,
             'date', to_char(d.date, 'YYYY-MM-DD'),
             'strengths', d.strengths,
             'weaknesses', d.weaknesses,
             'toLearn', d.to_learn,
             'createdBy', dc.name
           ) order by d.date) filter (where d.id is not null), '[]'::jsonb) as days
    from internship.list i
           join workers w on w.id = i.worker_id
           join workers c on c.id = i.curator_id
           left join internship.days d on d.internship_id = i.id
           left join workers dc on dc.id = d.created_by
    where i.id = $1
    group by i.id, w.name, c.name`

  const row = (await db.query(query, [id])).rows[0]

  if (!row) notFound()

  const canTransfer = !!checkPermissions(['transfer_internship'], worker)
  const curators = canTransfer ? await getCurators() : []

  return (
    <InternshipDetailPage
      internship={row as InternshipDetails}
      userId={worker.id}
      canTransfer={canTransfer}
      curators={curators}
    />
  )
}
