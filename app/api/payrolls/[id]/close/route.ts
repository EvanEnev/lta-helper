import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'
import {toId} from '@/lib/payrolls/validate'

// Закрытие ведомости: остаток каждого сотрудника переносится в его баланс
export async function PATCH(
  _req: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['edit_payrolls'], worker)) {
    return NextResponse.json({message: 'Недостаточно прав'}, {status: 403})
  }

  const payrollId = toId((await params).id)

  if (payrollId === null) {
    return NextResponse.json({message: 'Некорректная ведомость'}, {status: 400})
  }

  // Запрос обновляет баланс всех сотрудников. Для несуществующей ведомости или
  // черновика (в нём нет строк сотрудников) это обнулило бы балансы у всех -
  // поэтому сначала проверяем, что ведомость есть и опубликована
  const payroll = await db.query(
    'select is_published from payrolls.list where id = $1',
    [payrollId],
  )

  if (!payroll.rowCount) {
    return NextResponse.json({message: 'Ведомость не найдена'}, {status: 404})
  }

  if (!payroll.rows[0].is_published) {
    return NextResponse.json(
      {message: 'Нельзя закрыть неопубликованную ведомость'},
      {status: 400},
    )
  }

  try {
    await db.query(
      `update workers w
       set balance = (
         select value -
                coalesce(taken, 0) +
                coalesce(bonuses, 0) -
                coalesce(external_payment, 0)
         from relations.workers_payrolls wp
         where wp.worker_id = w.id
           and payroll_id = $1
       )`,
      [payrollId],
    )

    return NextResponse.json({}, {status: 200})
  } catch (e) {
    console.error(e)

    return NextResponse.json(
      {message: e instanceof Error ? e.message : 'Ошибка в запросе'},
      {status: 500},
    )
  }
}
