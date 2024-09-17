import conn from '@/lib/database'
import validateData from '@/lib/validateData'
import {Worker} from '@/src/utils/types'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const initData: string | undefined = body?.initData

  const user = await validateData(initData)
  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const telegramId = user.id
  const query = `SELECT "name" FROM lt_arena.workers WHERE telegram_id=${telegramId}`
  const result = await conn.query(query)
  const object = result.rows[0]

  const worker: Worker = {
    name: object?.name,
    workingDays: [],
    type: '',
    comments: [],
  }

  return NextResponse.json(object ? worker : {})
}
