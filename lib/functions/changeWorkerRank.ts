import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'

// Общая логика /api/workers/promote и /api/workers/demote.
// Ранг меняется на соседний по sorting_weight; требования прошлого ранга
// сбрасываются. Всё в одной транзакции.
export default async function changeWorkerRank(
  req: NextRequest,
  direction: 1 | -1,
) {
  const session = await auth.api.getSession({headers: await headers()})
  const worker = session?.user

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['edit_worker_rank'], worker)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  const body = await req.json().catch(() => null)
  const workerId = Number(body?.workerId)

  if (!Number.isInteger(workerId) || workerId <= 0) {
    return NextResponse.json({message: 'Сотрудник не указан'}, {status: 400})
  }

  const client = await db.connect()

  try {
    await client.query('begin')

    // Если соседнего ранга нет (старший/младший), строка не обновляется:
    // раньше в таком случае rank_id становился NULL
    const updated = await client.query(
      `update workers w
       set rank_id = next.id
       from ranks cur
       join ranks next on next.sorting_weight = cur.sorting_weight + $2
       where w.id = $1 and cur.id = w.rank_id
       returning functions.get_rank(next.id) as rank`,
      [workerId, direction],
    )

    if (!updated.rowCount) {
      await client.query('rollback')

      return NextResponse.json({message: 'Ранг изменить нельзя'}, {status: 400})
    }

    await client.query(
      'delete from relations.workers_requirements where worker_id = $1',
      [workerId],
    )

    await client.query('commit')

    return NextResponse.json({newRank: updated.rows[0].rank}, {status: 200})
  } catch (e) {
    await client.query('rollback').catch(() => {})
    console.error(e)

    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  } finally {
    client.release()
  }
}
