import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const worker = (await auth.api.getSession({headers: await headers()}))!.user

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['manage_permissions'], worker)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  const body = await req.json()
  const {worker_id, permission_id, expires} = body

  if (!worker_id || !permission_id) {
    return NextResponse.json({message: 'Не указан сотрудник или право'}, {status: 400})
  }

  try {
    await db.query(
      'DELETE FROM relations.workers_permissions WHERE worker_id = $1 AND permission_id = $2',
      [worker_id, permission_id],
    )
    await db.query(
      'INSERT INTO relations.workers_permissions (worker_id, permission_id, expires) VALUES ($1, $2, $3)',
      [worker_id, permission_id, expires ?? null],
    )
    return NextResponse.json({ok: true}, {status: 200})
  } catch (e) {
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  }
}

export async function DELETE(req: NextRequest) {
  const worker = (await auth.api.getSession({headers: await headers()}))!.user

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['manage_permissions'], worker)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  const body = await req.json()
  const {worker_id, permission_id} = body

  if (!worker_id || !permission_id) {
    return NextResponse.json({message: 'Не указан сотрудник или право'}, {status: 400})
  }

  try {
    await db.query(
      'DELETE FROM relations.workers_permissions WHERE worker_id = $1 AND permission_id = $2',
      [worker_id, permission_id],
    )
    return NextResponse.json({ok: true}, {status: 200})
  } catch (e) {
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  }
}
