import {NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {sendToWorkers} from '@/lib/push/send'

const COOLDOWN_MS = 10_000
const last = new Map<number, number>()

export async function POST() {
  const session = await auth.api.getSession({headers: await headers()})
  const worker = session?.user

  if (!worker?.id) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (Date.now() - (last.get(worker.id) ?? 0) < COOLDOWN_MS) {
    return NextResponse.json({message: 'Слишком часто'}, {status: 429})
  }

  last.set(worker.id, Date.now())

  const result = await sendToWorkers([worker.id], {
    title: 'Уведомления включены',
    body: 'Так будут выглядеть напоминания',
    url: '/profile',
    tag: 'test',
  })

  if (!result.sent) {
    return NextResponse.json(
      {message: 'Нет активных подписок на этом устройстве'},
      {status: 404},
    )
  }

  return NextResponse.json({sent: result.sent}, {status: 200})
}
