import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import {LTPaymentChangeData} from '@/src/utils/types'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  if (!checkPermissions(['edit_payments'], worker)) {
    return NextResponse.json({message: 'Недостаточно прав'}, {status: 500})
  }

  const body: LTPaymentChangeData = await req.json()

  if (!body.worker) {
    return NextResponse.json({message: 'Сотрудник не указан'}, {status: 500})
  }

  let query: string

  if (body.create) {
    query = `insert into lt_arena.payments
  (worker_id, payment_type, value, date, comment)
  values
    (
     (select id from lt_arena.workers where name ilike '${body.worker}' limit 1),
     ${body.type},
     ${body.value},
     '${body.date}',
     '${body.comment}'
    )
    returning id`
  } else if (body.delete) {
    query = `delete from lt_arena.payments where id = ${body.id}`
  } else {
    query = `update lt_arena.payments
             set payment_type = ${body.type},
                 value = ${body.value},
                 date = '${body.date}',
                 comment = ${body.comment ? `'${body.comment}'` : null}
             where id = ${body.id}
             returning id`
  }

  const result = await db.query(query)
  const id = result.rows[0]?.id

  return NextResponse.json({id}, {status: 200})
}
