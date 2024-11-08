import conn from '@/lib/database'
import validateData from '@/lib/validateData'
import getWorkerData from '@/lib/getWorkerData'
import {Comment, Worker} from '@/src/utils/types'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const initData: string | undefined = body?.initData

  const user = await validateData(initData)
  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const telegramId = user.id
  const dataQuery = `SELECT "name" FROM lt_arena.workers WHERE telegram_id=${telegramId}`
  const dataResult = await conn.query(dataQuery)
  const object = dataResult.rows[0]

  const commentsQuery = `SELECT * FROM lt_arena.comments WHERE worker='${object?.name}'`

  let worker: Worker = {
    name: object?.name,
    workingDays: [],
    type: '',
    comments: [],
    isAdmin: false,
  }

  const workerData = await getWorkerData(worker)
  worker = {...worker, ...workerData}

  const firstDate = worker.workingDays[0]?.date
  let removeOldCommentsQuery = `DELETE FROM lt_arena.comments WHERE TO_DATE(REPLACE(date, '.', ''), 'DDMM') < TO_DATE(REPLACE('${firstDate}', '.', ''), 'DDMM')`

  await conn.query(removeOldCommentsQuery)

  if (worker.name) {
    const commentsResult = await conn.query(commentsQuery)
    worker.comments = commentsResult.rows.map(
      (row: {date: string; value: string}) => ({
        date: row.date,
        value: row.value,
      }),
    )
  }

  return NextResponse.json(object ? worker : {})
}
