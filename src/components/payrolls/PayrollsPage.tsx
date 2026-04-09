'use client'

import {LTPayroll, LTWorker} from '@/src/utils/types'
import {Fragment, useCallback, useState} from 'react'
import PayrollCard from '@/src/components/payrolls/PayrollCard'
import PayrollCreateCard from '@/src/components/payrolls/PayrollsCreateCard'
import checkPermissions from '@/lib/functions/checkPermissions'

interface PayrollsPageProps {
  data: LTPayroll[]
  worker: LTWorker
}

export default function PayrollsPage({
  data: initialData,
  worker,
}: PayrollsPageProps) {
  const [data, setData] = useState(initialData)

  const onDelete = useCallback((payrollId: LTPayroll['id']) => {
    setData(prev => prev.filter(d => d.id !== payrollId))
  }, [])

  return (
    <main className="p-4">
      <div className="flex flex-row flex-wrap gap-4">
        {checkPermissions(['edit_payrolls'], worker) && <PayrollCreateCard />}
        {data.map(payroll => {
          return (
            <Fragment key={payroll.id}>
              <PayrollCard worker={worker} data={payroll} onDelete={onDelete} />
            </Fragment>
          )
        })}
      </div>
    </main>
  )
}
