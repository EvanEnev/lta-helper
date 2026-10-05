import {NextRequest, NextResponse} from 'next/server'
import requireManagePermissions, {
  toId,
} from '@/lib/functions/requireManagePermissions'
import db from '@/lib/database'

const DATE = /^\d{4}-\d{2}-\d{2}$/

export async function POST(req: NextRequest) {
  const denied = await requireManagePermissions()
  if (denied) return denied

  const body = await req.json().catch(() => null)
  const workerId = toId(body?.worker_id)
  const permissionId = toId(body?.permission_id)
  const expires: unknown = body?.expires ?? null

  if (workerId === null || permissionId === null) {
    return NextResponse.json(
      {message: 'Не указан сотрудник или право'},
      {status: 400},
    )
  }

  if (
    expires !== null &&
    !(typeof expires === 'string' && DATE.test(expires))
  ) {
    return NextResponse.json({message: 'Некорректная дата'}, {status: 400})
  }

  const client = await db.connect()

  try {
    await client.query('BEGIN')
    await client.query(
      'DELETE FROM relations.workers_permissions WHERE worker_id = $1 AND permission_id = $2',
      [workerId, permissionId],
    )
    await client.query(
      'INSERT INTO relations.workers_permissions (worker_id, permission_id, expires) VALUES ($1, $2, $3)',
      [workerId, permissionId, expires],
    )
    await client.query('COMMIT')

    return NextResponse.json({ok: true}, {status: 200})
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  } finally {
    client.release()
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireManagePermissions()
  if (denied) return denied

  const body = await req.json().catch(() => null)
  const workerId = toId(body?.worker_id)
  const permissionId = toId(body?.permission_id)

  if (workerId === null || permissionId === null) {
    return NextResponse.json(
      {message: 'Не указан сотрудник или право'},
      {status: 400},
    )
  }

  try {
    await db.query(
      'DELETE FROM relations.workers_permissions WHERE worker_id = $1 AND permission_id = $2',
      [workerId, permissionId],
    )
    return NextResponse.json({ok: true}, {status: 200})
  } catch (e) {
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  }
}
