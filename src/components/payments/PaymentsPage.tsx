'use client'

import {LTPayment, LTPaymentChangeData, LTPaymentType} from '@/src/utils/types'
import {Separator} from '@heroui/react-beta'
import {DateTime, Interval} from 'luxon'
import {useCallback, useEffect, useMemo, useState} from 'react'
import PaymentsRow from '@/src/components/payments/PaymentsRow'
import PaymentsHeader from '@/src/components/payments/PaymentsHeader'
import fetchHandler from '@/src/utils/global/fetchHandler'

interface PaymentsPageProps {
  paymentsTypes: LTPaymentType[]
  workers: string[]
  canEdit: boolean
}

export interface PaymentsFilter {
  name: 'name' | 'type' | 'dates'
  value: string | null
}

export default function PaymentsPage({
  paymentsTypes,
  workers,
  canEdit,
}: PaymentsPageProps) {
  const [initialPayments, setInitialPayments] = useState<LTPayment[]>([])
  const [payments, setPayments] = useState<LTPayment[]>([])
  const [filters, setFilters] = useState<PaymentsFilter[]>([
    {
      name: 'dates',
      value: Interval.fromDateTimes(
        DateTime.now().set({day: 1}),
        DateTime.now().set({day: 14}),
      ).toISO(),
    },
  ])

  useEffect(() => {
    ;(async () => {
      let filteredData: LTPayment[] = initialPayments

      const nameFilter = filters.find(d => d.name === 'name')
      const typeFilter = filters.find(d => d.name === 'type')
      const datesFilter = filters.find(d => d.name === 'dates')

      if (datesFilter?.value) {
        const res = await fetch('/api/payments/get', {
          method: 'POST',
          body: JSON.stringify({dates: datesFilter.value}),
        })

        filteredData = (await res.json()).data
      }

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

      setPayments(filteredData)
    })()
  }, [filters, initialPayments])

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
          setPayments(prev => [payment, ...prev])
        }
      }
    },
    [paymentsTypes],
  )

  const summary = useMemo(() => {
    console.debug(payments)
    return payments?.reduce((acc, cur) => acc + (cur.value || 0), 0) || 0
  }, [payments])

  return (
    <main className="flex flex-col gap-2 p-4">
      <PaymentsHeader
        summary={summary}
        canEdit={canEdit}
        paymentsTypes={paymentsTypes}
        setFilters={setFilters}
        setPayments={setPayments}
        initialDates={Interval.fromDateTimes(
          DateTime.now().set({day: 1}),
          DateTime.now().set({day: 14}),
        ).toISO()}
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
