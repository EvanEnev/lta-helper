import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import db from '@/lib/database'
import {LTPaymentType} from '@/src/utils/types'
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

  const paymentsTypesResult = await db.query(paymentsTypesQuery)

  const paymentsTypes: LTPaymentType[] = paymentsTypesResult.rows

  const workersQuery = `select w.name
from workers w
    left join ranks r on r.id = w.rank_id
    order by r.sorting_weight desc, w.name`

  const workersResult = await db.query(workersQuery)
  const workers: string[] = workersResult.rows.map(row => row.name)

  const canEdit = checkPermissions(['edit_payments'], worker)

  return (
    <PaymentsPage
      canEdit={canEdit}
      workers={workers}
      paymentsTypes={paymentsTypes}
    />
  )
}
