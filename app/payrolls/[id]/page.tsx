import checkPermissions from '@/lib/functions/checkPermissions'
import PayrollsDetailsPage from '@/src/components/payrolls/details/PayrollsDetailsPage'
import db from '@/lib/database'
import getLocations from '@/lib/functions/getLocations'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

interface PayrollDetailsProps {
  params: Promise<{id: string}>
}

export default async function PayrollDetails({params}: PayrollDetailsProps) {
  const {id} = await params

  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  const payrollDataQuery = `select
  p.id,
  dates,
  take_by as "takeBy",
  created_at as "createdAt",
  w.name as "createdBy",
  bonuses,
  (select count(*) from relations.workers_payrolls where payroll_id = p.id) as "workersCount"
  from payrolls.list p
  left join workers w on w.id = p.created_by
  where p.id = ${id}`

  let workersPayrollDataQuery = `select
    json_build_object(
        'name', w.name,
        'id', w.id,
        'rank', r.name
    ) as worker,
    wp.value as value,
    wp.bonuses,
    wp.issue_confirmed,
    l.id as location_id,
    json_build_object(
        'name', w2.name,
        'rank', r2.name
    ) as to_take_by,
    wp.to_take,
    wp.taken,
    wp.external_payment,
    json_build_object(
        'name', w3.name,
        'rank', r3.name
    ) as taken_by,
    wp.taken_at::text
from relations.workers_payrolls wp
left join workers w on wp.worker_id = w.id
left join payrolls.list p on wp.payroll_id = p.id
left join locations l on wp.location_id = l.id
left join workers w2 on wp.to_take_by = w2.id
left join workers w3 on wp.taken_by = w3.id
left join ranks r on w.rank_id = r.id
left join ranks r2 on w2.rank_id = r2.id
left join ranks r3 on w3.rank_id = r3.id
where p.id = ${id}`

  let moneyOnLocationsQuery = `
    select l.short_name as location, l.id as location_id, coalesce(lm.value, 0) as value
    from (select distinct(location_id) from relations.workers_payrolls where payroll_id = ${id}) lp
           left join locations l on l.id = lp.location_id
           left join payrolls.locations_money lm on lm.location_id = lp.location_id and lm.payroll_id = ${id}`

  if (!checkPermissions(['view_payrolls'], worker)) {
    workersPayrollDataQuery += `\nand p.id = -1`
    moneyOnLocationsQuery += `\nwhere lm.payroll_id = -1`
  }

  if (
    !checkPermissions(['view_all_payrolls'], worker) &&
    checkPermissions(['view_location_payrolls'], worker)
  ) {
    workersPayrollDataQuery += `\nand (wp.location_id = ${worker?.locationId} or wp.worker_id = ${worker?.id})`
    moneyOnLocationsQuery += `\nwhere lm.location_id = ${worker?.locationId}`
  }

  if (
    !checkPermissions(['view_all_payrolls', 'view_location_payrolls'], worker)
  ) {
    workersPayrollDataQuery += `\nand wp.worker_id = ${worker?.id}`
    moneyOnLocationsQuery += `\nwhere lm.payroll_id = -1`
  }

    moneyOnLocationsQuery += `\norder by l.name`
    workersPayrollDataQuery += `\norder by wp.taken is not null, wp.issue_confirmed, r.sorting_weight desc, w.name`

  const result = await db.query(workersPayrollDataQuery)
  const data = result.rows

  const locations = await getLocations()

  const moneyOnLocationsResult = await db.query(moneyOnLocationsQuery)
  const payrollResult = await db.query(payrollDataQuery)

  const moneyOnLocations = moneyOnLocationsResult.rows
  const payrollData = {
    ...payrollResult.rows[0],
    createdAt: payrollResult.rows[0].createdAt.toISO(),
    takeBy: payrollResult.rows[0].takeBy.toISO(),
    dates: payrollResult.rows[0].dates.toISO(),
  }

  return (
    <PayrollsDetailsPage
      payroll={payrollData}
      locations={locations}
      locationsData={moneyOnLocations}
      data={data}
    />
  )
}
