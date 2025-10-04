import {NextRequest, NextResponse} from 'next/server'
import createAdminSupabase from '@/lib/createAdminSupabase'
import {LTPayrollCreateData} from '@/src/utils/types'
import auth from '@/lib/auth/auth'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const supabase = await createAdminSupabase()
  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  const worker = await auth()

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
  insert into lt_arena.payrolls
  (dates, take_by, bonuses, created_by) values
  ('[${data.dates.start},${data.dates.end}]', '${data.takeBy}', ${data.withBonuses || 'NULL'}, ${worker.id})
  returning id`

  const payrollCreateResult = await db.query(createPayrollQuery)
  const payrollId: number = payrollCreateResult.rows[0].id

  const createWorkersPayrollQuery = `
  insert into lt_arena.workers_payrolls
  (worker_id, payroll_id, value, location_id, bonuses, external_payment) values
  ${data.workersData
    .filter(d => d.location !== -1)
    .map(
      worker =>
        `(${worker.workerId}, ${payrollId}, ${worker.value}, ${worker.location}, ${data.withBonuses ? (worker.bonuses || 0) + (worker.fines || 0) : 'NULL'}, ${worker.external_payment ? worker.external_payment : 'NULL'})`,
    )
    .join(',\n')}`

  const createMoneyOnLocationsQuery = `
    insert into lt_arena.locations_money
    (location_id, payroll_id, value) values
    ${data.moneyOnLocations.map(d => `(${d.location}, ${payrollId}, ${d.value || 'NULL'})`).join(',\n')}`

  await db.query(createWorkersPayrollQuery)
  await db.query(createMoneyOnLocationsQuery)

  return NextResponse.json({}, {status: 200})
}
