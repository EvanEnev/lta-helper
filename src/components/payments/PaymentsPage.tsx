'use client'

import {LTPayment, LTPaymentChangeData, LTPaymentType} from '@/src/utils/types'
import {Separator} from '@heroui/react-beta'
import {DateTime, Interval} from 'luxon'
import {useCallback, useEffect, useState} from 'react'
import PaymentsRow from '@/src/components/payments/PaymentsRow'
import PaymentsHeader from '@/src/components/payments/PaymentsHeader'
import useIsScrolled from '@/src/hooks/useIsScrolled'
import fetchHandler from '@/src/utils/global/fetchHandler'

interface PaymentsPageProps {
  paymentsTypes: LTPaymentType[]
  payments: LTPayment[]
  workers: string[]
  canEdit: boolean
}

export interface PaymentsFilter {
  name: 'name' | 'type' | 'dates'
  value: string | null
}

export default function PaymentsPage({
  paymentsTypes,
  payments: paymentsData,
  workers,
  canEdit,
}: PaymentsPageProps) {
  const [payments, setPayments] = useState(paymentsData)
  const scrolled = useIsScrolled()
  const [filters, setFilters] = useState<PaymentsFilter[]>([])

  useEffect(() => {
    if (!filters?.length) {
      return setPayments(paymentsData)
    }

    let filteredData: LTPayment[] = paymentsData

    const nameFilter = filters.find(d => d.name === 'name')
    const typeFilter = filters.find(d => d.name === 'type')
    const datesFilter = filters.find(d => d.name === 'dates')

    if (nameFilter?.value) {
      filteredData = filteredData.filter(d =>
        d.worker?.name
          .toLowerCase()
          .trim()
          .startsWith(nameFilter.value?.toLowerCase().trim() || ''),
      )
    }

    if (typeFilter?.value) {
      filteredData = filteredData.filter(d => d.type === typeFilter.value)
    }

    if (datesFilter?.value) {
      const interval = Interval.fromISO(datesFilter.value)
      filteredData = filteredData.filter(d => {
        const date = DateTime.fromISO(d.date)
        return interval.contains(date)
      })
    }

    setPayments(filteredData)
  }, [filters, paymentsData])

  const updateData = useCallback(
    async (payment: LTPayment) => {
      setPayments(prev => prev.map(d => (d.id === payment.id ? payment : d)))

      const type = paymentsTypes.find(d => d.name === payment.type)?.id

      const sendData: LTPaymentChangeData = {
        id: payment.id,
        value: payment.value || null,
        comment: payment.comment || null,
        create: !!payment.create,
        delete: !!payment.delete,
        date: payment.date,
        worker: payment.worker?.name || '',
        type: type || null,
      }

      const res = await fetchHandler({
        url: '/api/payments/edit',
        method: 'POST',
        body: sendData,
      })

      if (res) {
        if (res.id !== payment.id && !sendData.delete) {
          setPayments(prev => prev.filter(d => d.id !== payment.id))
          setPayments(prev => [res, ...prev])
        }
      }
    },
    [paymentsTypes],
  )

  return (
    <main className="flex flex-col gap-2 p-4">
      <PaymentsHeader
        canEdit={canEdit}
        scrolled={scrolled}
        paymentsTypes={paymentsTypes}
        setFilters={setFilters}
        setPayments={setPayments}
      />
      <Separator />
      <div className="flex flex-wrap gap-4">
        {payments.map(payment => {
          return (
            <PaymentsRow
              canEdit={canEdit}
              workers={workers}
              updateData={updateData}
              paymentsTypes={paymentsTypes}
              payment={payment}
              setPayments={setPayments}
              key={payment.id}
            />
          )
        })}
      </div>
    </main>
  )
}
