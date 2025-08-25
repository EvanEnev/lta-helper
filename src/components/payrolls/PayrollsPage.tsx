'use client'

import {LTPayroll} from '@/src/utils/types'
import {Fragment} from 'react'
import {Button, Card, CardBody, CardFooter, CardHeader} from '@heroui/react'
import {DateTime, Interval} from 'luxon'
import Link from 'next/link'
import {Pen2} from 'solar-icon-set'
import PayrollCard from '@/src/components/payrolls/PayrollCard'
import PayrollCreateCard from '@/src/components/payrolls/PayrollsCreateCard'

interface PayrollsPageProps {
  data: LTPayroll[]
}

export default function PayrollsPage({data}: PayrollsPageProps) {
  return (
    <main className="p-4">
      <div className="flex flex-row flex-wrap gap-4">
        <PayrollCreateCard />
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
