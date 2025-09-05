'use client'

import {LTLocation, LTWorkerPayrollData} from '@/src/utils/types'

interface PayrollsDetailsPageProps {
  data: LTWorkerPayrollData[]
  locations: LTLocation[]
}

export default function PayrollsDetailsPage({
  data,
  locations,
}: PayrollsDetailsPageProps) {
  return <main className="p-4"></main>
}
