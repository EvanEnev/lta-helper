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
  const query = `SELECT workers.name, workers.rank, ranks.permission_level FROM lt_arena.workers workers LEFT JOIN lt_arena.ranks ranks ON ranks.name=workers.rank WHERE workers.telegram_id=${telegramId}`
  const result = await conn.query(query)
  const object = result.rows[0]

  const worker: Worker = {
    name: object?.name,
    workingDays: [],
    type: '',
    comments: [],
    isAdmin: object?.permission_level === 4,
  }

  return NextResponse.json(object ? worker : {})
}
