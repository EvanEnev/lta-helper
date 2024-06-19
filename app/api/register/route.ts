import conn from '@/lib/database'
import validateData from '@/lib/validateData'
import {User} from '@/src/utils/types'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest) {
  // @ts-ignore
  const body = await req.json()

  const user: User | undefined = body?.user
  const name: string | undefined = body?.name

  if (!(user && Object.keys(user).length !== 0)) {
    return NextResponse.json({message: 'Пользователь не указан'}, {status: 404})
  }

  if (!(await validateData(user?.initData))) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  if (!name) {
    return NextResponse.json({message: 'Позывной не указан'}, {status: 500})
  }

  const telegramId = user?.initDataUnsafe?.user?.id
  const query = `INSERT INTO "lt-arena"."workers" (telegram_id, name) VALUES (${telegramId}, '${name}')`
  await conn.query(query)

  return NextResponse.json(
    {message: 'OK', worker: {name, telegramId}},
    {status: 200},
  )
}
