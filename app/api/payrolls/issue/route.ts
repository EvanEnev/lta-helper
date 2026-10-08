import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {toId} from '@/lib/payrolls/validate'

const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

export async function POST(req: NextRequest) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) return fail('Вход не произведён', 401)

  if (!checkPermissions(['issue_payrolls'], worker)) {
    return fail('Недостаточно прав', 403)
  }

  const body = await req.json().catch(() => null)
  const workerId = toId(body?.worker_id)
  const payrollId = toId(body?.payroll_id)
  const value = Number(body?.value)

  if (workerId === null) return fail('Не предоставлен сотрудник')
  if (payrollId === null) return fail('Не предоставлена ведомость')
  if (!Number.isInteger(value) || value === 0) {
    return fail('Не предоставлена сумма выдачи')
  }

  try {
    const result = await db.query(
      `update relations.workers_payrolls
       set taken = $1,
           taken_by = coalesce(to_take_by, worker_id),
           taken_at = now()::timestamp(0),
           issue_confirmed = false
       where worker_id = $2
         and payroll_id = $3
         and issue_confirmed is true
         and to_take = $1
         and ($4::boolean or location_id = $5::int)`,
      [
        value,
        workerId,
        payrollId,
        checkPermissions(['admin'], worker) === true,
        worker.locationId ?? null,
      ],
    )

    if (!result.rowCount) {
      return fail(
        'Выдача недоступна: нет подтверждения, другая площадка или сумма изменилась',
        409,
      )
    }

    return NextResponse.json({}, {status: 200})
  } catch (e) {
    console.error(e)

    return fail(e instanceof Error ? e.message : 'Ошибка в запросе', 500)
  }
}
