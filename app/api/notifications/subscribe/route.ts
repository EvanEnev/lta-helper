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

  await db.query(
    'insert into relations.workers_notifications (worker_id, data) values ($1, $2)',
    [worker.id, data],
  )

  return NextResponse.json({}, {status: 200})
}
