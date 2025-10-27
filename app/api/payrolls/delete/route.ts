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

  if (!checkPermissions(['edit_payrolls'], worker)) {
    return NextResponse.json({message: 'Недостаточно прав'}, {status: 400})
  }

  const body = await req.json()

  if (!body?.payroll_id) {
    return NextResponse.json(
      {message: 'Не предоставлена ведомость'},
      {status: 400},
    )
  }

  const deletePayrollQuery = `
  delete from lt_arena.payrolls where id = ${body.payroll_id}`

  await db.query(deletePayrollQuery)

  return NextResponse.json({}, {status: 200})
}
