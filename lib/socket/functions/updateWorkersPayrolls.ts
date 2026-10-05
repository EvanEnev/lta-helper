import {SocketUpdateProps} from '@/src/utils/types'

const toId = (value: unknown) => {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

// Право 'edit_payrolls' проверяет guarded() в socket.ts
export default async function updateWorkersPayrolls({
  data,
  client,
}: SocketUpdateProps) {
  const workerId = toId(data?.worker_id)
  const payrollId = toId(data?.payroll_id)
  if (workerId === null || payrollId === null) return

  await client.query(
    `update relations.workers_payrolls
     set value = $1,
         bonuses = $2,
         location_id = $3,
         external_payment = $4
     where worker_id = $5
       and payroll_id = $6`,
    [
      data.value,
      data.bonuses || null,
      data.location_id ?? null,
      data.external_payment || null,
      workerId,
      payrollId,
    ],
  )
}
