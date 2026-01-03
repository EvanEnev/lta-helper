import db from '@/lib/database'
import PayrollIssuePage from '@/src/components/payrolls/issue/PayrollIssuePage'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

export default async function PayrollIssue() {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  const query = `select
    p.id,
    p.take_by,
    p.dates,
    l.name as location,
    wp.value + coalesce(wp.bonuses, 0) - coalesce(wp.external_payment, 0) as value,
    wp.issue_confirmed,
    wp.external_payment,
    w2.name as to_take_by,
    wp.taken
    from payrolls.list p
    left join relations.workers_payrolls wp on wp.worker_id = ${worker?.id} and wp.payroll_id = p.id
    left join locations l on l.id = wp.location_id
    left join workers w on w.id = ${worker?.id}
    left join workers w2 on w2.id = wp.to_take_by
    where p.take_by >= NOW()::date
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
  r.name as rank,
  w.id
  from workers w
  left join ranks r on r.id = w.rank_id
  order by r.sorting_weight desc, w.name`

  const takeByQuery = `select
  to_take,
  w.name,
  w.id,
  wp.payroll_id,
  wp.location_id
  from relations.workers_payrolls wp
  left join workers w on w.id = wp.worker_id
  where wp.to_take_by = ${worker?.id} and (wp.taken = 0 or wp.taken is null)
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
