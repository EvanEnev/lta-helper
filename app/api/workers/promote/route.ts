import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['edit_worker_rank'], worker)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  const workerId = body.workerId
  if (!workerId) {
    return NextResponse.json({message: 'Сотрудник не указан'}, {status: 400})
  }

  const queries = `
    update workers set rank_id = (select id from ranks where sorting_weight = (select sorting_weight from ranks where id = workers.rank_id) + 1) where id = ${workerId} returning functions.get_rank((select id from ranks where sorting_weight = (select sorting_weight from ranks where id = workers.rank_id) + 1)) as rank;
    delete from relations.workers_requirements where worker_id = ${workerId};
  `

  let newRank

  try {
    const res = await db.query(queries)
    newRank = res.rows[0].rank
  } catch (e) {
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  }

  return NextResponse.json({newRank}, {status: 200})
}
