import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'
import {toId} from '@/lib/payrolls/validate'

const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})
  const user = session?.user

  if (!user) return fail('Вход не произведён', 401)
  if (!checkPermissions(['edit_worker_rank'], user)) {
    return fail('Нет прав', 403)
  }

  const body = await req.json().catch(() => null)
  const workerId = toId(body?.workerId)
  const rankId = toId(body?.rankId)

  if (workerId === null) return fail('Сотрудник не указан')
  if (rankId === null) return fail('Ранг не указан')

  const client = await db.connect()

  try {
    await client.query('begin')

    const current = await client.query(
      'select rank_id from workers where id = $1 for update',
      [workerId],
    )

    if (!current.rowCount) {
      await client.query('rollback')

      return fail('Сотрудник не найден', 404)
    }

    if (current.rows[0].rank_id === rankId) {
      await client.query('rollback')

      return fail('Этот ранг уже установлен')
    }

    const updated = await client.query(
      `update workers
       set rank_id = r.id
       from ranks r
       where workers.id = $1
         and r.id = $2
       returning functions.get_rank(r.id) as rank`,
      [workerId, rankId],
    )

    if (!updated.rowCount) {
      await client.query('rollback')

      return fail('Ранг не найден', 404)
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

    return fail('Ошибка в запросе', 500)
  } finally {
    client.release()
  }
}
