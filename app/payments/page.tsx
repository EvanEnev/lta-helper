import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import db from '@/lib/database'
import {LTPayment, LTPaymentType} from '@/src/utils/types'
import PaymentsPage from '@/src/components/payments/PaymentsPage'
import checkPermissions from '@/lib/functions/checkPermissions'
import {redirect} from 'next/navigation'

export default async function Payments() {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return redirect('/login')
  }

  const paymentsTypesQuery = `select id, name, ranks, percent, value from lt_arena.payments_types`
  let paymentsQuery = `select
                           lt_arena.payments.id,
                           get_worker(worker_id) as worker,
                           (select name from lt_arena.payments_types where id = payment_type) as type,
                           value,
                           comment,
                           date::text
from lt_arena.payments
left join lt_arena.workers w on w.id = worker_id
left join lt_arena.ranks r on r.name ilike w.rank
`

  if (!checkPermissions(['view_all_payments'], worker)) {
    paymentsQuery += `where lt_arena.payments.worker_id = ${worker?.id}\n`
  }

  paymentsQuery += `order by date desc, r.sorting_weight desc, w.name`

  const paymentsTypesResult = await db.query(paymentsTypesQuery)
  const paymentsResult = await db.query(paymentsQuery)

  const paymentsTypes: LTPaymentType[] = paymentsTypesResult.rows
  const payments: LTPayment[] = paymentsResult.rows

  const workersQuery = `select w.name
from lt_arena.workers w
    left join lt_arena.ranks r on r.name ilike w.rank
    order by r.sorting_weight desc, w.name`

  const workersResult = await db.query(workersQuery)
  const workers: string[] = workersResult.rows.map(row => row.name)

  const canEdit = checkPermissions(['edit_payments'], worker)

  return (
    <PaymentsPage
      canEdit={canEdit}
      workers={workers}
      paymentsTypes={paymentsTypes}
      payments={payments}
    />
  )
}
