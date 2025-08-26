'use client'

import {LTLocation, LTPayroll} from '@/src/utils/types'
import {Fragment} from 'react'
import PayrollCard from '@/src/components/payrolls/PayrollCard'
import PayrollCreateCard from '@/src/components/payrolls/PayrollsCreateCard'

interface PayrollsPageProps {
  data: LTPayroll[]
    locations: LTLocation[]
}

export default function PayrollsPage({data, locations}: PayrollsPageProps) {
  return (
    <main className="p-4">
      <div className="flex flex-row flex-wrap gap-4">
        <PayrollCreateCard locations={locations}/>
        {data.map(payroll => {
          return (
            <Fragment key={payroll.id}>
              <PayrollCard data={payroll} />
            </Fragment>
          )
        })}
      </div>
    </main>
  )
}
