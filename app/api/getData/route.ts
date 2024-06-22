import {performance} from 'perf_hooks'
import conn from '@/lib/database'
import validateData from '@/lib/validateData'
import getWorkerData from '@/src/utils/getWorkerData'
import {User, Worker} from '@/src/utils/types'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const user: User | undefined = body?.user

  if (!(user && Object.keys(user)?.length !== 0)) {
    return NextResponse.json({message: 'Пользователь не указан'}, {status: 404})
  }

  const valid = await validateData(user?.initData)
  if (!valid) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const telegramId = user?.initDataUnsafe?.user?.id
  const query = `SELECT "name" FROM "lt-arena"."workers" WHERE telegram_id=${telegramId}`
  const result = await conn.query(query)
  const object = result.rows[0]

  const worker: Worker = {
    name: object?.name,
    valid,
    workingDays: [],
  }

  if (worker) {
    const workingDays = await getWorkerData(worker)
    worker.workingDays = workingDays
  }

  return NextResponse.json(object ? worker : {valid})
}
