'use client'

import {LTLocation, LTPayroll} from '@/src/utils/types'
import {Fragment, useCallback, useEffect, useState} from 'react'
import PayrollCard from '@/src/components/payrolls/PayrollCard'
import PayrollCreateCard from '@/src/components/payrolls/PayrollsCreateCard'
import {useAuth} from '@/src/components/global/providers/authProvider'
import checkPermissions from '@/lib/functions/checkPermissions'

interface PayrollsPageProps {
  data: LTPayroll[]
  locations: LTLocation[]
}

export default function PayrollsPage({
  data: initialData,
  locations,
}: PayrollsPageProps) {
  const [data, setData] = useState(initialData)
  const {worker, setExiting} = useAuth()

  useEffect(() => {
    setExiting(false)
  }, [setExiting])

  const onDelete = useCallback((payrollId: LTPayroll['id']) => {
    setData(prev => prev.filter(d => d.id !== payrollId))
  }, [])

  return (
    <main className="p-4">
      <div className="flex flex-row flex-wrap gap-4">
        {checkPermissions(['edit_payrolls'], worker) && (
          <PayrollCreateCard locations={locations} />
        )}
        {data.map(payroll => {
          return (
            <Fragment key={payroll.id}>
              <PayrollCard data={payroll} onDelete={onDelete} />
            </Fragment>
          )
        })}
      </div>
    </main>
  )
}
