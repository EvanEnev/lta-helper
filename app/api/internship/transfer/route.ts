import {NextRequest, NextResponse} from 'next/server'
import {headers} from 'next/headers'
import db from '@/lib/database'
import {auth} from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import {fail} from '@/lib/internship/access'
import {getCurators} from '@/lib/internship/curators'
import {toId} from '@/lib/payrolls/validate'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})
  const user = session?.user

  if (!user) return fail('Вход не произведён', 401)
  if (!checkPermissions(['transfer_internship'], user)) {
    return fail('Недостаточно прав', 403)
  }

  const body = await req.json().catch(() => null)
  const internshipId = toId(body?.internshipId)
  const curatorId = toId(body?.curatorId)

  if (internshipId === null) return fail('Не выбрана стажировка')
  if (curatorId === null) return fail('Не выбран куратор')

  try {
    const curators = await getCurators()

    if (!curators.some(c => c.id === curatorId)) {
      return fail('Этот сотрудник не может быть куратором')
    }

    const updated = await db.query(
      `update internship.list
       set curator_id = $2
       where id = $1
         and closed_at is null`,
      [internshipId, curatorId],
    )

    if (!updated.rowCount) return fail('Стажировка не найдена или закрыта', 404)

    return NextResponse.json({})
  } catch (e) {
    console.error(e)

    return fail('Ошибка в запросе', 500)
  }
}
