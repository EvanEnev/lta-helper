import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {fail, requireCurator, text} from '@/lib/internship/access'
import {toId} from '@/lib/payrolls/validate'

export async function POST(req: NextRequest) {
  const {error, user} = await requireCurator()
  if (error) return error

  const body = await req.json().catch(() => null)
  const internshipId = toId(body?.internshipId)
  const summary = text(body?.summary, 4000)

  if (internshipId === null) return fail('Не выбрана стажировка')
  if (body?.result !== 'passed' && body?.result !== 'failed') {
    return fail('Не выбран итог')
  }
  if (summary === null) return fail('Слишком длинный текст')

  const client = await db.connect()

  try {
    await client.query('begin')

    const closed = await client.query(
      `update internship.list
       set closed_at = now(),
           closed_by = $2,
           result    = $3,
           summary   = $4
       where id = $1
         and closed_at is null
         and curator_id = $2
       returning worker_id`,
      [internshipId, user.id, body.result, summary],
    )

    if (!closed.rowCount) {
      await client.query('rollback')

      return fail(
        'Стажировка не найдена, закрыта или ведётся другим куратором',
        404,
      )
    }

    let newRank: string | null = null

    if (body.result === 'passed') {
      const workerId: number = closed.rows[0].worker_id

      const promoted = await client.query(
        `update workers w
         set rank_id = next.id
         from ranks cur
                join lateral (
           select n.id
           from ranks n
           where n.sorting_weight > cur.sorting_weight
           order by n.sorting_weight
           limit 1
           ) next on true
         where w.id = $1
           and cur.id = w.rank_id
           and cur.name ilike 'стаж_р'
         returning functions.get_rank(next.id) as rank`,
        [workerId],
      )

      if (promoted.rowCount) {
        newRank = promoted.rows[0].rank

        await client.query(
          'delete from relations.workers_requirements where worker_id = $1',
          [workerId],
        )
      }
    }

    await client.query('commit')

    return NextResponse.json({newRank})
  } catch (e) {
    await client.query('rollback').catch(() => {})
    console.error(e)

    return fail('Ошибка в запросе', 500)
  } finally {
    client.release()
  }
}
