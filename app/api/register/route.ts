import conn from '@/lib/database'
import validateData from '@/lib/validateData'
import getWorkerData from '@/lib/getDefaultDays'
import {NextRequest, NextResponse} from 'next/server'
import getDefaultDays from '@/lib/getDefaultDays'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const initData: string | undefined = body?.initData
  const name: string | undefined = body?.name

  const user = await validateData(initData)
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
