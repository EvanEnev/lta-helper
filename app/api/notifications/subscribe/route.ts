import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  const body = await req.json()

  const sub: PushSubscription | undefined = body.sub
  if (!sub) {
    return NextResponse.json({message: 'Нет подписки'}, {status: 500})
  }

  const query = `insert into relations.workers_notifications (worker_id, data) values (${worker.id}, '${JSON.stringify(sub)}')`

  await db.query(query)

  return NextResponse.json({}, {status: 200})
}
