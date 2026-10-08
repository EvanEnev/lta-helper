'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {DateTime} from 'luxon'
import {Building2, Hash, UserRound, Wallet} from 'lucide-react'
import {Skeleton} from '@/components/ui/skeleton'
import type {DatePeriod} from '@/src/components/global/DateRangePopover'
import StatTile from '@/src/components/global/StatTile'
import fetchHandler from '@/src/utils/global/fetchHandler'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {
  LTPayment,
  LTPaymentChangeData,
  LTPaymentType,
} from '@/src/utils/types'
import PaymentRow, {ROW_GRID} from './PaymentRow'
import PaymentsToolbar from './PaymentsToolbar'

interface PaymentsPageProps {
  paymentsTypes: LTPaymentType[]
  workers: string[]
  canEdit: boolean
}

const ZONE = 'Europe/Moscow'

const TYPE_ICONS = [Building2, UserRound, Wallet]
const ALL = 'all'

const halfMonth = (month: DateTime, half: 1 | 2): DatePeriod =>
  half === 1
    ? {
        start: month.startOf('month'),
        end: month.startOf('month').plus({days: 14}),
      }
    : {
        start: month.startOf('month').plus({days: 15}),
        end: month.endOf('month'),
      }

export default function PaymentsPage({
  paymentsTypes,
  workers,
  canEdit,
}: PaymentsPageProps) {
  const now = DateTime.now().setZone(ZONE)
  const [period, setPeriod] = useState<DatePeriod>(
    halfMonth(now, now.day <= 15 ? 1 : 2),
  )
  const [payments, setPayments] = useState<LTPayment[]>([])
  const [isLoading, setLoading] = useState(true)
  const [isTransferring, setTransferring] = useState(false)
  const [type, setType] = useState(ALL)
  const [query, setQuery] = useState('')

  const extraPresets = useMemo(() => {
    const prev = now.minus({months: 1})

    return [
      {label: '1–15', period: halfMonth(now, 1)},
      {label: '16–конец', period: halfMonth(now, 2)},
      {label: `Пред. 16–конец`, period: halfMonth(prev, 2)},
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now.month, now.year])

  const requestId = useRef(0)

  const load = useCallback(
    async (silent = false) => {
      const id = ++requestId.current
      if (!silent) setLoading(true)

      try {
        const dates = `${period.start.toFormat('yyyy-MM-dd')}T00:00:00/${period.end.toFormat('yyyy-MM-dd')}T23:00:00`

        const json = await fetchHandler({
          url: '/api/payments/get',
          body: {dates},
          showNotification: false,
        })

        if (id === requestId.current && json?.data) setPayments(json.data)
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    },
    [period],
  )

  useEffect(() => {
    load()
  }, [load])

  const create = () =>
    setPayments(prev => [
      {
        id: -Date.now(),
        create: true,
        date: DateTime.now().setZone(ZONE).toFormat('yyyy-MM-dd'),
      },
      ...prev,
    ])

  const save = useCallback(
    async (payment: LTPayment) => {
      const body: LTPaymentChangeData = {
        id: payment.id,
        value: payment.value ?? null,
        comment: payment.comment || null,
        create: !!payment.create,
        delete: false,
        date: payment.date,
        worker: payment.worker?.name || '',
        type: paymentsTypes.find(t => t.name === payment.type)?.id ?? null,
      }

      const res = await fetchHandler({
        url: '/api/payments/edit',
        method: 'POST',
        body,
      })

      if (!res) return false

      setPayments(prev =>
        prev.map(p =>
          p.id === payment.id
            ? {...payment, id: res.id ?? payment.id, create: false}
            : p,
        ),
      )

      return true
    },
    [paymentsTypes],
  )

  const remove = useCallback(async (payment: LTPayment) => {
    const res = await fetchHandler({
      url: '/api/payments/edit',
      method: 'POST',
      body: {
        id: payment.id,
        delete: true,
        create: false,
        date: payment.date,
        worker: payment.worker?.name || '',
        type: null,
        value: null,
        comment: null,
      } satisfies LTPaymentChangeData,
    })

    if (res) setPayments(prev => prev.filter(p => p.id !== payment.id))
  }, [])

  const discardNew = useCallback(
    (id: number) => setPayments(prev => prev.filter(p => p.id !== id)),
    [],
  )

  const transfer = async () => {
    setTransferring(true)

    try {
      const res = await fetchHandler({
        url: '/api/payments/transfer',
        body: {
          startDate: period.start.toFormat('yyyy-MM-dd'),
          endDate: period.end.toFormat('yyyy-MM-dd'),
        },
      })

      if (res) await load(true)
    } finally {
      setTransferring(false)
    }
  }

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()

    return payments.filter(
      p =>
        (type === ALL || p.type === type) &&
        (!text || (p.worker?.name ?? '').toLowerCase().includes(text)),
    )
  }, [payments, type, query])

  const {sum, byType} = useMemo(() => {
    const byType = new Map<string, number>()
    let sum = 0

    for (const payment of visible) {
      const value = payment.value || 0
      sum += value
      if (payment.type) {
        byType.set(payment.type, (byType.get(payment.type) ?? 0) + value)
      }
    }

    return {sum, byType}
  }, [visible])

  return (
    <main
      className={cn(
        'flex min-w-0 flex-col gap-3 p-4',
        'max-sm:h-[calc(100dvh-4rem)] sm:h-dvh',
      )}>
      <div className="shrink-0">
        <PaymentsToolbar
          period={period}
          onPeriodChange={setPeriod}
          extraPresets={extraPresets}
          paymentsTypes={paymentsTypes}
          type={type}
          onTypeChange={setType}
          query={query}
          onQueryChange={setQuery}
          canEdit={canEdit}
          onCreate={create}
          onTransfer={transfer}
          isTransferring={isTransferring}
          isLoading={isLoading}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto [contain:inline-size]">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            icon={Wallet}
            value={`${separateNumber(sum)} ₽`}
            label="Сумма"
          />
          <StatTile icon={Hash} value={visible.length} label="Выплат" />
          {[...byType.entries()].map(([name, value], index) => (
            <StatTile
              key={name}
              icon={TYPE_ICONS[index % TYPE_ICONS.length]}
              value={`${separateNumber(value)} ₽`}
              label={name}
            />
          ))}
        </div>

        {isLoading && payments.length === 0 ? (
          <div className="flex flex-col gap-2">
            {Array.from({length: 6}, (_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : visible.length ? (
          <div className={cn('flex flex-col gap-2', isLoading && 'opacity-60')}>
            <div
              aria-hidden
              className={cn(
                'text-muted-foreground bg-background sticky top-0 z-10 hidden gap-x-3 px-3.5 py-2 text-xs md:grid',
                ROW_GRID,
              )}>
              <span>Дата</span>
              <span>Сотрудник</span>
              <span>Тип</span>
              <span>Сумма</span>
              <span>Комментарий</span>
              <span />
            </div>
            {visible.map(payment => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                paymentsTypes={paymentsTypes}
                workers={workers}
                canEdit={canEdit}
                onSave={save}
                onDelete={remove}
                onDiscardNew={discardNew}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-12 text-center text-sm">
            За выбранный период выплат нет
          </p>
        )}
      </div>
    </main>
  )
}
