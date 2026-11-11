import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {Suspense} from 'react'
import {notFound, redirect} from 'next/navigation'
import PayrollsDetailsSkeleton from '@/src/components/payrolls/details/PayrollsDetailsSkeleton'
import PayrollDetailsContent from '@/src/components/payrolls/details/PayrollsDetailsContent'

interface PayrollDetailsProps {
  params: Promise<{id: string}>
}

export default async function PayrollDetails({params}: PayrollDetailsProps) {
  const id = Number((await params).id)

  const worker = (await auth.api.getSession({headers: await headers()}))?.user

  if (!worker) redirect('/login')
  if (!Number.isInteger(id) || id <= 0) notFound()

  return (
    <Suspense fallback={<PayrollsDetailsSkeleton />}>
      <PayrollDetailsContent id={id} worker={worker} />
    </Suspense>
  )
}
