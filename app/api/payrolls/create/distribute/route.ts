import {NextRequest, NextResponse} from 'next/server'
import checkPermissions from '@/lib/functions/checkPermissions'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {distributeAction} from '@/app/actions/distribute'

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

  if (!body?.date) {
    return NextResponse.json({message: 'Не предоставлена дата'}, {status: 400})
  }

  if (!body?.workers?.length) {
    return NextResponse.json(
      {message: 'Не предоставлены сотрудники'},
      {status: 400},
    )
  }

  if (!body?.locations?.length) {
    return NextResponse.json(
      {message: 'Не предоставлены локации'},
      {status: 400},
    )
  }

  const data = await distributeAction(body.date, body.workers, body.locations)

  if (typeof data === 'string') {
    return NextResponse.json({message: data}, {status: 500})
  }

  return NextResponse.json(data, {status: 200})
}
