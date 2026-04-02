import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {LTPayment} from '@/src/utils/types'
import checkPermissions from '@/lib/functions/checkPermissions'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {Interval} from 'luxon'

export async function POST(req: NextRequest) {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  const body = await req.json()
  const dates = body?.dates
  if (!dates) {
    return NextResponse.json({message: 'Не указаны даты'}, {status: 500})
  }

  const interval = Interval.fromISO(dates)

  let paymentsQuery = `select
                           pl.id,
                           functions.get_worker(worker_id) as worker,
                           (select name from payments.types where id = payment_type) as type,
                           value,
                           comment,
                           date::text
from payments.list pl
left join workers w on w.id = worker_id
left join ranks r on r.id = w.rank_id
where pl.date between '${interval.start!.toFormat('yyyy-MM-dd')}' and '${interval.end!.toFormat('yyyy-MM-dd')}'
`

  if (!checkPermissions(['view_all_payments'], worker)) {
    paymentsQuery += `\nand pl.worker_id = ${worker?.id}\n`
  }

  paymentsQuery += `\norder by date desc, r.sorting_weight desc, w.name`

  const paymentsResult = await db.query(paymentsQuery)
  const payments: LTPayment[] = paymentsResult.rows

  return NextResponse.json({data: payments}, {status: 200})
}
