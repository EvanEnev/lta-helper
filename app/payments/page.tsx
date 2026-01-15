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

  const paymentsTypesQuery = `select id, name, ranks, percent, value from payments.types`
  let paymentsQuery = `select
                           payments.list.id,
                           functions.get_worker(worker_id) as worker,
                           (select name from payments.types where id = payment_type) as type,
                           value,
                           comment,
                           date::text
from payments.list
left join workers w on w.id = worker_id
left join ranks r on r.name ilike w.rank
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
from workers w
    left join ranks r on r.name ilike w.rank
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
