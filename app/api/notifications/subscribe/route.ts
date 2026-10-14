import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})
  const worker = session?.user

  if (!worker?.id) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  const body = await req.json().catch(() => null)
  const sub = body?.sub

  if (
    typeof sub?.endpoint !== 'string' ||
    !sub.endpoint.startsWith('https://') ||
    sub.endpoint.length > 2000 ||
    typeof sub?.keys?.p256dh !== 'string' ||
    typeof sub?.keys?.auth !== 'string'
  ) {
    return NextResponse.json({message: 'Нет подписки'}, {status: 400})
  }

  const data = JSON.stringify({
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime ?? null,
    keys: {p256dh: sub.keys.p256dh, auth: sub.keys.auth},
  })

  const client = await db.connect()

  try {
    await client.query('begin')
    await client.query(
      "delete from relations.workers_notifications where data->>'endpoint' = $1",
      [sub.endpoint],
    )
    await client.query(
      'insert into relations.workers_notifications (worker_id, data) values ($1, $2)',
      [worker.id, data],
    )
    await client.query('commit')
  } catch (error) {
    await client.query('rollback').catch(() => {})
    console.error('[subscribe]', error)

    return NextResponse.json({message: 'Не удалось сохранить'}, {status: 500})
  } finally {
    client.release()
  }

  return NextResponse.json({}, {status: 200})
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})
  const worker = session?.user

  if (!worker?.id) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  const body = await req.json().catch(() => null)

  if (typeof body?.endpoint !== 'string') {
    return NextResponse.json({message: 'Нет подписки'}, {status: 400})
  }

  await db.query(
    "delete from relations.workers_notifications where worker_id = $1 and data->>'endpoint' = $2",
    [worker.id, body.endpoint],
  )

  return NextResponse.json({}, {status: 200})
}
