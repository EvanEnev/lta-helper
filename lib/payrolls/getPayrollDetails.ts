import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'
import type {LTWorker} from '@/src/utils/types'

export default async function getPayrollDetails(id: number, worker: LTWorker) {
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
  where p.id = $1`

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
where p.id = $1`

  let moneyOnLocationsQuery = `
    select l.name as location, l.id as location_id, coalesce(lm.value, 0) as value
    from (select distinct(location_id) from relations.workers_payrolls where payroll_id = $1) lp
           left join locations l on l.id = lp.location_id
           left join payrolls.locations_money lm on lm.location_id = lp.location_id and lm.payroll_id = $1`

  const workersParams: unknown[] = [id]
  const moneyParams: unknown[] = [id]

  if (!checkPermissions(['view_payrolls'], worker)) {
    workersPayrollDataQuery += `\nand p.id = -1`
    moneyOnLocationsQuery += `\nwhere lm.payroll_id = -1`
  } else if (
    !checkPermissions(['view_all_payrolls'], worker) &&
    checkPermissions(['view_location_payrolls'], worker)
  ) {
    workersParams.push(worker?.locationId ?? null, worker?.id ?? null)
    moneyParams.push(worker?.locationId ?? null)

    workersPayrollDataQuery += `\nand (wp.location_id = $2::int or wp.worker_id = $3::int)`
    moneyOnLocationsQuery += `\nwhere lm.location_id = $2::int`
  } else if (
    !checkPermissions(['view_all_payrolls', 'view_location_payrolls'], worker)
  ) {
    workersParams.push(worker?.id ?? null)

    workersPayrollDataQuery += `\nand wp.worker_id = $2::int`
    moneyOnLocationsQuery += `\nwhere lm.payroll_id = -1`
  }

  moneyOnLocationsQuery += `\norder by l.name`
  workersPayrollDataQuery += `\norder by wp.taken is not null, wp.issue_confirmed, r.sorting_weight desc, w.name`

  const [moneyOnLocationsResult, payrollResult, result] = await Promise.all([
    db.query(moneyOnLocationsQuery, moneyParams),
    db.query(payrollDataQuery, [id]),
    db.query(workersPayrollDataQuery, workersParams),
  ])

  return {
    rows: result.rows,
    moneyOnLocations: moneyOnLocationsResult.rows,
    payroll: payrollResult.rows[0] as
      | {
          id: number
          dates: {toISO(): string}
          takeBy: {toISO(): string}
          createdAt: {toISO(): string}
          createdBy: string
          bonuses: boolean | null
          workersCount: string
        }
      | undefined,
  }
}
