import getLocations from '@/lib/functions/getLocations'
import db from '@/lib/database'
import {LTWorker} from '@/src/utils/types'
import checkPermissions from '@/lib/functions/checkPermissions'
import PayrollsDetailsPage from '@/src/components/payrolls/details/PayrollsDetailsPage'

interface PayrollsDetailsContentProps {
  id: number
  worker: LTWorker
}

export default async function PayrollDetailsContent({
  id,
  worker,
}: PayrollsDetailsContentProps) {
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
        'rank', r.name,
        '_searchName', lower(unaccent(w.name))
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
    select l.name as location, l.id as location_id, coalesce(lm.value, 0) as value
    from (select distinct(location_id) from relations.workers_payrolls where payroll_id = ${id}) lp
           left join locations l on l.id = lp.location_id
           left join payrolls.locations_money lm on lm.location_id = lp.location_id and lm.payroll_id = ${id}`

  if (!checkPermissions(['view_payrolls'], worker)) {
    workersPayrollDataQuery += `\nand p.id = -1`
    moneyOnLocationsQuery += `\nwhere lm.payroll_id = -1`
  } else if (
    !checkPermissions(['view_all_payrolls'], worker) &&
    checkPermissions(['view_location_payrolls'], worker)
  ) {
    workersPayrollDataQuery += `\nand (wp.location_id = ${worker?.locationId} or wp.worker_id = ${worker?.id})`
    moneyOnLocationsQuery += `\nwhere lm.location_id = ${worker?.locationId}`
  } else if (
    !checkPermissions(['view_all_payrolls', 'view_location_payrolls'], worker)
  ) {
    workersPayrollDataQuery += `\nand wp.worker_id = ${worker?.id}`
    moneyOnLocationsQuery += `\nwhere lm.payroll_id = -1`
  }

  moneyOnLocationsQuery += `\norder by l.name`
  workersPayrollDataQuery += `\norder by wp.taken is not null, wp.issue_confirmed, r.sorting_weight desc, w.name`

  const [locations, moneyOnLocationsResult, payrollResult, result] =
    await Promise.all([
      getLocations(),
      db.query(moneyOnLocationsQuery),
      db.query(payrollDataQuery),
      db.query(workersPayrollDataQuery),
    ])

  const data = result.rows

  const moneyOnLocations = moneyOnLocationsResult.rows
  const payrollData = {
    ...payrollResult.rows[0],
    createdAt: payrollResult.rows[0].createdAt.toISO(),
    takeBy: payrollResult.rows[0].takeBy.toISO(),
    dates: payrollResult.rows[0].dates.toISO(),
  }

  return (
    <PayrollsDetailsPage
      payrollId={id}
      worker={worker}
      payroll={payrollData}
      locations={locations}
      locationsData={moneyOnLocations}
      data={data}
    />
  )
}
