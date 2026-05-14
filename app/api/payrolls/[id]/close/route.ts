import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  if (!checkPermissions(['edit_payrolls'], worker)) {
    return NextResponse.json({message: 'Недостаточно прав'}, {status: 500})
  }

  const {id} = await params

  const query = `
    update workers w
    set balance = (
    select value -
           coalesce(taken, 0) +
           coalesce(bonuses, 0) -
           coalesce(external_payment, 0)
    from relations.workers_payrolls wp where wp.worker_id = w.id and payroll_id = ${id}
    )`

  try {
    await db.query(query)
    return NextResponse.json({}, {status: 200})
  } catch (e) {
    // @ts-ignore
    console.error(e.message)
    // @ts-ignore
    return NextResponse.json({message: e.message}, {status: 500})
  }
}
