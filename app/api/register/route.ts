import conn from '@/lib/database'
import {NextRequest, NextResponse} from 'next/server'
import getDefaultDays from '@/lib/getDefaultDays'
import {auth} from '@/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const name: string | undefined = body?.name

  const session = await auth()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  if (!name) {
    return NextResponse.json({message: 'Позывной не указан'}, {status: 500})
  }

  const telegramId = user.id
  const query = `INSERT INTO "lt_arena"."workers" (telegram_id, name) VALUES (${telegramId}, '${name.trim()}')`
  await conn.query(query)

  const defaultDays = await getDefaultDays()
  const workingDays = defaultDays.map((day: string) => ({date: day}))

  return NextResponse.json({worker: {name, workingDays}}, {status: 200})
}
