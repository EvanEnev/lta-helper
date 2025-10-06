import auth from '@/lib/auth/auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import PayrollsDetailsPage from '@/src/components/payrolls/details/PayrollsDetailsPage'
import db from '@/lib/database'
import getLocations from '@/lib/functions/getLocations'

interface PayrollDetailsProps {
  params: Promise<{id: string}>
}

export default async function PayrollDetails({params}: PayrollDetailsProps) {
  const {id} = await params

  const worker = await auth()

  const payrollDataQuery = `select
  p.id,
  dates,
  take_by as "takeBy",
  created_at as "createdAt",
  w.name as "createdBy",
  bonuses,
  (select count(*) from lt_arena.workers_payrolls where payroll_id = p.id) as "workersCount"
  from lt_arena.payrolls p
  left join lt_arena.workers w on w.id = p.created_by
  where p.id = ${id}`

  let workersPayrollDataQuery = `select
    json_build_object(
        'name', w.name,
        'id', w.id,
        'rank', w.rank
    ) as worker,
    wp.value as value,
    wp.bonuses,
    wp.issue_confirmed,
    l.id as location_id,
    w2.name as to_take_by,
    wp.to_take,
    wp.taken,
    wp.external_payment,
    w3.name as taken_by,
    wp.taken_at::text
from lt_arena.workers_payrolls wp
left join lt_arena.workers w on wp.worker_id = w.id
left join lt_arena.payrolls p on wp.payroll_id = p.id
left join lt_arena.locations l on wp.location_id = l.id
left join lt_arena.workers w2 on wp.to_take_by = w2.id
left join lt_arena.workers w3 on wp.taken_by = w3.id
where p.id = ${id}`

  let moneyOnLocationsQuery = `
    select
      l.name as location,
      l.id as location_id,
      lm.value
    from lt_arena.locations_money lm
           left join lt_arena.locations l on l.id = lm.location_id
    where lm.payroll_id = ${id} and value is not null`

  if (!checkPermissions(['view_payrolls'], worker)) {
    workersPayrollDataQuery += `\nand p.id = -1`
    moneyOnLocationsQuery += `\nand lm.payroll_id = -1`
  }

  if (
    !checkPermissions(['view_all_payrolls'], worker) &&
    checkPermissions(['view_location_payrolls'], worker)
  ) {
    workersPayrollDataQuery += `\nand wp.location_id = ${worker.locationId} or wp.worker_id = ${worker.id}`
    moneyOnLocationsQuery += `\nand lm.location_id = ${worker.locationId}`
  }

  if (
    !checkPermissions(['view_all_payrolls', 'view_location_payrolls'], worker)
  ) {
    workersPayrollDataQuery += `\nand wp.worker_id = ${worker.id}`
    moneyOnLocationsQuery += `\nand lm.payroll_id = -1`
  }

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
