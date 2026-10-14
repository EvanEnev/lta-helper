import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {fail, requireCurator, text} from '@/lib/internship/access'
import {isDate, toId} from '@/lib/payrolls/validate'

const MAX_TEXT = 2000

export async function POST(req: NextRequest) {
  const {error, user} = await requireCurator()
  if (error) return error

  const body = await req.json().catch(() => null)
  const internshipId = toId(body?.internshipId)
  const strengths = text(body?.strengths, MAX_TEXT)
  const weaknesses = text(body?.weaknesses, MAX_TEXT)
  const toLearn = text(body?.toLearn, MAX_TEXT)

  if (internshipId === null) return fail('Не выбрана стажировка')
  if (!isDate(body?.date)) return fail('Некорректная дата')
  if (strengths === null || weaknesses === null || toLearn === null) {
    return fail('Слишком длинный текст')
  }
  if (!strengths && !weaknesses && !toLearn) return fail('Фидбэк пустой')

  try {
    const saved = await db.query(
      `insert into internship.days
         (internship_id, date, strengths, weaknesses, to_learn, created_by)
       select l.id, $2::date, $3, $4, $5, $6
       from internship.list l
       where l.id = $1
         and l.closed_at is null
         and l.curator_id = $6
       on conflict (internship_id, date) do update
         set strengths  = excluded.strengths,
             weaknesses = excluded.weaknesses,
             to_learn   = excluded.to_learn,
             updated_at = now()
       returning id`,
      [internshipId, body.date, strengths, weaknesses, toLearn, user.id],
    )

    if (!saved.rowCount)
      return fail(
        'Стажировка не найдена, закрыта или ведётся другим куратором',
        404,
      )

    return NextResponse.json({id: saved.rows[0].id})
  } catch (e) {
    console.error(e)

    return fail('Ошибка в запросе', 500)
  }
}
