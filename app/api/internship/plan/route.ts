import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {fail, requireCurator} from '@/lib/internship/access'
import {toId} from '@/lib/payrolls/validate'

export async function POST(req: NextRequest) {
  const {error, user} = await requireCurator()
  if (error) return error

  const body = await req.json().catch(() => null)
  const internshipId = toId(body?.internshipId)
  const plannedDays = toId(body?.plannedDays)

  if (internshipId === null) return fail('Не выбрана стажировка')
  if (plannedDays === null || plannedDays > 60) {
    return fail('Некорректное число дней')
  }

  try {
    const updated = await db.query(
      `update internship.list
       set planned_days = $2
       where id = $1
         and closed_at is null
         and curator_id = $3`,
      [internshipId, plannedDays, user.id],
    )

    if (!updated.rowCount)
      return fail(
        'Стажировка не найдена, закрыта или ведётся другим куратором',
        404,
      )

    return NextResponse.json({})
  } catch (e) {
    console.error(e)

    return fail('Ошибка в запросе', 500)
  }
}
