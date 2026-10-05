import {notFound} from 'next/navigation'
import getLocations from '@/lib/functions/getLocations'
import {LTPayroll, LTWorker} from '@/src/utils/types'
import getPayrollDetails from '@/lib/payrolls/getPayrollDetails'
import PayrollsDetailsPage from '@/src/components/payrolls/details/PayrollsDetailsPage'

interface PayrollsDetailsContentProps {
  id: number
  worker: LTWorker
}

export default async function PayrollDetailsContent({
  id,
  worker,
}: PayrollsDetailsContentProps) {
  const [locations, details] = await Promise.all([
    getLocations(),
    getPayrollDetails(id, worker),
  ])

  if (!details.payroll) notFound()

  const payrollData = {
    ...details.payroll,
    createdAt: details.payroll.createdAt.toISO(),
    takeBy: details.payroll.takeBy.toISO(),
    dates: details.payroll.dates.toISO(),
  }

  return (
    <PayrollsDetailsPage
      payrollId={id}
      worker={worker}
      payroll={payrollData as unknown as LTPayroll}
      locations={locations}
      locationsData={details.moneyOnLocations}
      data={details.rows}
    />
  )
}
