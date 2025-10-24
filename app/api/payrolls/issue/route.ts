import {NextRequest, NextResponse} from 'next/server'
import createAdminSupabase from '@/lib/createAdminSupabase'
import auth from '@/lib/auth/auth'
import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'

export async function POST(req: NextRequest) {
  const supabase = await createAdminSupabase()
  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  const worker = await auth()

  const body = await req.json()

  if (!checkPermissions(['issue_payrolls'], worker)) {
    return NextResponse.json({message: 'Недостаточно прав'}, {status: 500})
  }

  if (!body?.worker_id) {
    return NextResponse.json(
      {message: 'Не предоставлен сотрудник'},
      {status: 400},
    )
  }

  if (!body?.payroll_id) {
    return NextResponse.json(
      {message: 'Не предоставлена ведомость'},
      {status: 400},
    )
  }

  if (!body?.value) {
    return NextResponse.json(
      {message: 'Не предоставлена сумма выдачи'},
      {status: 400},
    )
  }

  const updateWorkerPayrollQuery = `
    update lt_arena.workers_payrolls
    set taken = ${body.value}, taken_by=coalesce(to_take_by, worker_id), taken_at=now()::timestamp(0), issue_confirmed=false 
    where worker_id = ${body.worker_id} and payroll_id = ${body.payroll_id}
  `

  const updateWorkersBalanceQuery = `
    update lt_arena.workers
    set balance = (select (value + coalesce(bonuses, 0)  - external_payment) - ${body.value || 0}
                   from lt_arena.workers_payrolls
                   where worker_id = ${body.worker_id}
                     and payroll_id = ${body.payroll_id})
    where id = ${body.worker_id}`

  await db.query(updateWorkerPayrollQuery)
  await db.query(updateWorkersBalanceQuery)

  return NextResponse.json({}, {status: 200})
}
