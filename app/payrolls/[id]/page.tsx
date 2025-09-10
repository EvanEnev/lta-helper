import auth from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import {DateTime} from 'luxon'
import {LTLocation, LTPayroll, LTWorker} from '@/src/utils/types'
import PayrollsDetailsPage from "@/src/components/payrolls/details/PayrollsDetailsPage";
import db from "@/lib/database";
import getLocations from "@/lib/functions/getLocations";

interface PayrollDetailsProps {
  params: Promise<{id: string}>
}

export default async function PayrollDetails({params}: PayrollDetailsProps) {
  const {id} = await params

  const worker = await auth()

  let workersPayrollDataQuery = `select
    json_build_object(
        'name', w.name,
        'id', w.id,
        'rank', w.rank
    ) as worker,
    wp.value,
    wp.bonuses,
    wp.issue_confirmed,
    l.id as location_id,
    w2.name as to_take_by,
    wp.taken,
    w3.name as taken_by,
    wp.taken_at
from lt_arena.workers_payrolls wp
left join lt_arena.workers w on wp.worker_id = w.id
left join lt_arena.payrolls p on wp.payroll_id = p.id
left join lt_arena.locations l on wp.location_id = l.id
left join lt_arena.workers w2 on wp.to_take_by = w2.id
left join lt_arena.workers w3 on wp.taken_by = w3.id
where p.id = ${id}`

  if (!checkPermissions(['view_payrolls'], worker)) {
    workersPayrollDataQuery += `\nand p.id = -1`
  }

  if (
    !checkPermissions(['view_all_payrolls'], worker) &&
    checkPermissions(['view_location_payrolls'], worker)
  ) {
    workersPayrollDataQuery += `\nand wp.location_id = ${worker.locationId}`
  }

  if (
    !checkPermissions(['view_all_payrolls', 'view_location_payrolls'], worker)
  ) {
    workersPayrollDataQuery += `\nand wp.worker_id = ${worker.id}`
  }

  const result = await db.query(workersPayrollDataQuery)
    const data = result.rows

    const locations = await getLocations()

  return <PayrollsDetailsPage data={data} locations={locations} />
}
