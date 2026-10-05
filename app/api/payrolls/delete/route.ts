import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {toId} from '@/lib/payrolls/validate'

export async function POST(req: NextRequest) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['edit_payrolls'], worker)) {
    return NextResponse.json({message: 'Недостаточно прав'}, {status: 403})
  }

  const body = await req.json().catch(() => null)
  const payrollId = toId(body?.payroll_id)

  if (payrollId === null) {
    return NextResponse.json(
      {message: 'Не предоставлена ведомость'},
      {status: 400},
    )
  }

  try {
    await db.query('delete from payrolls.list where id = $1', [payrollId])

    return NextResponse.json({}, {status: 200})
  } catch (e) {
    console.error(e)

    return NextResponse.json(
      {message: e instanceof Error ? e.message : 'Ошибка в запросе'},
      {status: 500},
    )
  }
}
