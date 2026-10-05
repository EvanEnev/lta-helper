import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {LTPayment} from '@/src/utils/types'
import checkPermissions from '@/lib/functions/checkPermissions'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {Interval} from 'luxon'

export async function POST(req: NextRequest) {
  const worker = (await auth.api.getSession({headers: await headers()}))?.user

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  const body = await req.json().catch(() => null)
  const dates = body?.dates
  if (typeof dates !== 'string') {
    return NextResponse.json({message: 'Не указаны даты'}, {status: 400})
  }

  const interval = Interval.fromISO(dates)
  if (!interval.isValid) {
    return NextResponse.json({message: 'Некорректные даты'}, {status: 400})
  }

  // без права view_all_payments - только свои выплаты
  const onlyOwn = !checkPermissions(['view_all_payments'], worker)

  const result = await db.query(
    `select
       pl.id,
       functions.get_worker(worker_id) as worker,
       (select name from payments.types where id = payment_type) as type,
       value,
       comment,
       date::text
     from payments.list pl
            left join workers w on w.id = worker_id
            left join ranks r on r.id = w.rank_id
     where pl.date between $1::date and $2::date
       and ($3::int is null or pl.worker_id = $3::int)
     order by date desc, r.sorting_weight desc, w.name`,
    [
      interval.start!.toFormat('yyyy-MM-dd'),
      interval.end!.toFormat('yyyy-MM-dd'),
      onlyOwn ? worker.id : null,
    ],
  )

  const payments: LTPayment[] = result.rows

  return NextResponse.json({data: payments}, {status: 200})
}
