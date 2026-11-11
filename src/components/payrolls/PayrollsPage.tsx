'use client'

import {useCallback, useState} from 'react'
import checkPermissions from '@/lib/functions/checkPermissions'
import type {LTPayroll, LTWorker} from '@/src/utils/types'
import PayrollCard from './PayrollCard'
import PayrollCreateDialog from './PayrollCreateDialog'

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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-4">
        {checkPermissions(['edit_payrolls'], worker) && <PayrollCreateDialog />}
        {data.map(payroll => (
          <PayrollCard
            key={payroll.id}
            worker={worker}
            data={payroll}
            onDelete={onDelete}
          />
        ))}
      </div>
    </main>
  )
}
