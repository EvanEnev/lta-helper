import {NextRequest, NextResponse} from 'next/server'
import {LTPayrollCreateData} from '@/src/utils/types'
import db from '@/lib/database'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

export async function POST(req: NextRequest) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  const body = await req.json()

  if (!body?.dates) {
    return NextResponse.json({message: 'Даты не предоставлены'}, {status: 400})
  }

  if (!body?.takeBy) {
    return NextResponse.json(
      {message: 'Не предоставлена дата выдачи'},
      {status: 400},
    )
  }

  if (!body?.workersData?.length) {
    return NextResponse.json(
      {message: 'Не предоставлена информация о сотрудниках'},
      {status: 400},
    )
  }

  const data: LTPayrollCreateData = {...body}

  const createPayrollQuery = `
  insert into payrolls.list
  (dates, take_by, bonuses, created_by, is_published) values
  ('[${data.dates.start},${data.dates.end}]', '${data.takeBy}', ${data.withBonuses || 'NULL'}, ${worker.id}, ${data.isPublished})
  on conflict (dates) do update set
                          take_by=excluded.take_by,
                          is_published=excluded.is_published
  returning id`

  const payrollCreateResult = await db.query(createPayrollQuery)
  const payrollId: number = payrollCreateResult.rows[0].id

  const createWorkersPayrollQuery = `
  insert into relations.workers_payrolls
  (worker_id, payroll_id, value, location_id, bonuses, external_payment) values
  ${data.workersData
    .filter(d => d.location !== -1)
    .map(
      worker =>
        `(${worker.workerId}, ${payrollId}, ${worker.value + worker.balance}, ${worker.location}, ${(worker.bonuses || 0) + (worker.fines || 0) != 0 ? (worker.bonuses || 0) + (worker.fines || 0) : 'NULL'}, ${worker.external_payment ? worker.external_payment : 'NULL'})`,
    )
    .join(',\n')}
    on conflict (worker_id, payroll_id) do update set
    value = excluded.value,
    location_id = excluded.location_id,
    bonuses = excluded.bonuses,
    external_payment = excluded.external_payment`

  const createMoneyOnLocationsQuery = `
    insert into payrolls.locations_money
    (location_id, payroll_id, value) values
    ${data.moneyOnLocations.map(d => `(${d.location}, ${payrollId}, ${d.value || 'NULL'})`).join(',\n')}
                                     on conflict (location_id, payroll_id) do update set
                                     value = excluded.value`

  await db.query(createWorkersPayrollQuery)
  await db.query(createMoneyOnLocationsQuery)

  return NextResponse.json({id: payrollId}, {status: 200})
}
