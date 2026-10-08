import {NextRequest, NextResponse} from 'next/server'
import {DateTime} from 'luxon'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'

const toId = (value: unknown) => {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

export async function POST(req: NextRequest) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) return fail('Вход не произведён', 401)
  if (!checkPermissions(['edit_payments'], worker)) {
    return fail('Недостаточно прав', 403)
  }

  const body = await req.json().catch(() => null)
  if (!body) return fail('Некорректный запрос')

  try {
    if (body.delete) {
      const id = toId(body.id)
      if (id === null) return fail('Не указана выплата')

      await db.query('delete from payments.list where id = $1', [id])

      return NextResponse.json({id}, {status: 200})
    }

    const typeId = toId(body.type)
    const value = Number(body.value)
    const date = String(body.date ?? '')
    const comment =
      typeof body.comment === 'string' && body.comment.trim()
        ? body.comment.trim().slice(0, 1000)
        : null
    const workerName = typeof body.worker === 'string' ? body.worker.trim() : ''

    if (!workerName) return fail('Сотрудник не указан')
    if (typeId === null) return fail('Не указан тип выплаты')
    if (!Number.isInteger(value) || value === 0) return fail('Не указана сумма')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !DateTime.fromISO(date).isValid) {
      return fail('Некорректная дата')
    }

    const found = await db.query(
      'select id from workers where lower(name) = lower($1) limit 1',
      [workerName],
    )
    const workerId: number | undefined = found.rows[0]?.id

    if (!workerId) return fail('Сотрудник не найден', 404)

    const type = await db.query('select 1 from payments.types where id = $1', [
      typeId,
    ])
    if (!type.rowCount) return fail('Тип выплаты не найден', 404)

    if (body.create) {
      const result = await db.query(
        `insert into payments.list (worker_id, payment_type, value, date, comment)
         values ($1, $2, $3, $4, $5)
         returning id`,
        [workerId, typeId, value, date, comment],
      )

      return NextResponse.json({id: result.rows[0]?.id}, {status: 200})
    }

    const id = toId(body.id)
    if (id === null) return fail('Не указана выплата')

    const result = await db.query(
      `update payments.list
       set worker_id = $1,
           payment_type = $2,
           value = $3,
           date = $4,
           comment = $5
       where id = $6
       returning id`,
      [workerId, typeId, value, date, comment, id],
    )

    if (!result.rowCount) return fail('Выплата не найдена', 404)

    return NextResponse.json({id: result.rows[0].id}, {status: 200})
  } catch (e) {
    console.error(e)

    return fail(e instanceof Error ? e.message : 'Ошибка в запросе', 500)
  }
}
