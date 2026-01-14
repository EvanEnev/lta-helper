import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'
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
    update relations.workers_payrolls
    set taken = ${body.value}, taken_by=coalesce(to_take_by, worker_id), taken_at=now()::timestamp(0), issue_confirmed=false 
    where worker_id = ${body.worker_id} and payroll_id = ${body.payroll_id}
  `

  // const updateWorkersBalanceQuery = `
  //   update workers
  //   set balance = (select (value + coalesce(bonuses, 0)  - external_payment) - ${body.value || 0}
  //                  from relations.workers_payrolls
  //                  where worker_id = ${body.worker_id}
  //                    and payroll_id = ${body.payroll_id})
  //   where id = ${body.worker_id}`

  await db.query(updateWorkerPayrollQuery)
  // await db.query(updateWorkersBalanceQuery)

  return NextResponse.json({}, {status: 200})
}
