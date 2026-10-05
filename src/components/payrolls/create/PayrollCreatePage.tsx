'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useRouter} from 'next/navigation'
import {DateTime, Interval} from 'luxon'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {Skeleton} from '@/components/ui/skeleton'
import {safeEvaluate} from '@/src/components/global/FormulaField'
import fetchHandler from '@/src/utils/global/fetchHandler'
import separateNumber from '@/lib/functions/separateNumber'
import {cn} from '@/lib/utils'
import type {
  LTLocation,
  LTPayrollCreateData,
  LTPayrollData,
  LTRank,
  LTWorker,
} from '@/src/utils/types'
import CreateTable, {
  rowTotal,
  type CreateRowData,
  type EditableField,
} from './CreateTable'
import CreateToolbar from './CreateToolbar'
import LocationsMoney, {type LocationMoney} from './LocationsMoney'

interface PayrollCreatePageProps {
  data: {
    name: LTWorker['name']
    fio: string
    id: LTWorker['id']
    rank: LTRank['name']
    balance: number
    value: number
    overwork: number
    bonuses: number
    fines: number
    external: number
    games: number
    [key: string]: number | string | LTWorker['name'] | LTWorker['id']
  }[]
  dates: {start: string; end: string}
  workersBonusesRange: {start: string; end: string}
  bonuses: boolean
  moneyOnLocations: {location: LTLocation['id']; value: number}[]
  locations: LTLocation[]
}

const DRAFT_KEY = 'payrollsCreate'
const HIDDEN_ON_MONEY = ['выезд', 'отдел продаж']
// на эти площадки сотрудника выдача не назначается
const HIDDEN_FOR_WORKERS = ['другое', 'выезд', 'отдел продаж']
const ALL: LTLocation = {
  id: 0,
  name: 'Все',
  shortName: 'Все',
  color: '',
  konsol_id: null,
}

interface Draft {
  workersData?: LTPayrollData[]
  takeBy?: string
  moneyOnLocations?: LocationMoney[]
  dates?: {start: string; end: string}
}

const readDraft = (): Draft => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') ?? {}
  } catch {
    return {}
  }
}

export default function PayrollCreatePage({
  data,
  dates: initialDates,
  workersBonusesRange,
  bonuses,
  moneyOnLocations: initialMoney,
  locations,
}: PayrollCreatePageProps) {
  const router = useRouter()

  const baseRows = useMemo<LTPayrollData[]>(
    () =>
      data.map(d => ({
        workerId: d.id,
        external_payment: d.external,
        location: -1,
        value: d.value + d.overwork + d.games,
        fines: d.fines,
        bonuses: d.bonuses,
        balance: d.balance,
      })),
    [data],
  )

  // ВАЖНО: payrollData - то, что уйдёт на сервер. Фильтры ниже его не меняют
  // (раньше фильтр по локации подменял эти данные, и публиковалась только их часть)
  const [payrollData, setPayrollData] = useState(baseRows)
  const [takeBy, setTakeBy] = useState(
    DateTime.now().plus({days: 7}).toFormat('yyyy-MM-dd'),
  )
  const [money, setMoney] = useState<LocationMoney[]>(initialMoney)
  const [dates, setDates] = useState(initialDates)
  const [ready, setReady] = useState(false)

  const [locationFilter, setLocationFilter] = useState(0)
  const [onlyEmpty, setOnlyEmpty] = useState(false)
  const [moneyOpen, setMoneyOpen] = useState(false)
  const [isDistributing, setDistributing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)

  // черновик читаем после монтирования: на сервере localStorage нет
  useEffect(() => {
    const draft = readDraft()

    if (draft.workersData?.length) setPayrollData(draft.workersData)
    if (draft.takeBy) setTakeBy(draft.takeBy)
    if (draft.moneyOnLocations) setMoney(draft.moneyOnLocations)
    if (draft.dates) setDates(draft.dates)

    setReady(true)
  }, [])

  // автосохранение черновика (с небольшой задержкой)
  useEffect(() => {
    if (!ready) return

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            withBonuses: bonuses,
            workersData: payrollData,
            takeBy,
            dates,
            workersBonusesRange,
            moneyOnLocations: money,
          }),
        )
      } catch {}
    }, 400)

    return () => clearTimeout(timer)
  }, [ready, bonuses, payrollData, takeBy, dates, workersBonusesRange, money])

  const interval = useMemo(
    () => Interval.fromISO(`${dates.start}/${dates.end}`),
    [dates.start, dates.end],
  )

  const info = useMemo(
    () =>
      new Map(
        data.map(
          d => [d.id, {name: d.name, fio: d.fio, rank: d.rank}] as const,
        ),
      ),
    [data],
  )

  const updateMoney = useCallback((locationId: number, raw: string) => {
    const value = safeEvaluate(raw || '0')

    setMoney(prev => {
      const next: LocationMoney =
        value === null
          ? {
              location: locationId,
              value: prev.find(d => d.location === locationId)?.value ?? 0,
              error: true,
            }
          : {location: locationId, value}

      return prev.some(d => d.location === locationId)
        ? prev.map(d => (d.location === locationId ? next : d))
        : [...prev, next]
    })
  }, [])

  const update = useCallback(
    (workerId: number, field: EditableField, value: number) => {
      // штрафы всегда хранятся отрицательными
      const next = field === 'fines' && value > 0 ? -value : value

      setPayrollData(prev =>
        prev.map(d => (d.workerId === workerId ? {...d, [field]: next} : d)),
      )
    },
    [],
  )

  const distribute = useCallback(async () => {
    setDistributing(true)

    try {
      const result = await fetchHandler({
        url: '/api/payrolls/create/distribute',
        body: {
          date: DateTime.now()
            .setZone('Europe/Moscow')
            .plus({days: 1})
            .toFormat('yyyy-MM-dd'),
          workers: payrollData.map(d => ({
            worker_id: d.workerId,
            amount: rowTotal(d),
          })),
          locations: money.map(d => ({
            location_id: d.location,
            value: d.value,
            priority: 0,
          })),
        },
      })

      if (result) {
        setPayrollData(prev =>
          prev.map(d => ({
            ...d,
            location:
              result.find(
                (r: {employee_id: number; location_id: number}) =>
                  r.employee_id === d.workerId,
              )?.location_id ?? -1,
          })),
        )
      }
    } finally {
      setDistributing(false)
    }
  }, [money, payrollData])

  const send = useCallback(
    async (isPublished: boolean) => {
      setSaving(true)

      try {
        const body: LTPayrollCreateData = {
          withBonuses: bonuses,
          workersData: payrollData,
          takeBy,
          dates,
          // флаг ошибки формулы - служебный, на сервер не уходит
          moneyOnLocations: money.map(({location, value}) => ({
            location,
            value,
          })),
          isPublished,
          meta: null,
        }

        if (!isPublished) {
          try {
            body.meta = localStorage.getItem(DRAFT_KEY) || {}
          } catch {}
        }

        const result = await fetchHandler({
          url: '/api/payrolls/create',
          method: 'POST',
          body,
        })

        if (result?.id && isPublished) {
          try {
            localStorage.removeItem(DRAFT_KEY)
          } catch {}
          router.push(`/payrolls/${result.id}`)
        }
      } finally {
        setSaving(false)
        setConfirmPublish(false)
      }
    },
    [bonuses, dates, money, payrollData, router, takeBy],
  )

  // ---------- отображаемое (фильтры не влияют на данные для отправки) ----------
  const locationOptions = useMemo(() => [ALL, ...locations], [locations])
  const selectableLocations = useMemo(
    () =>
      locations.filter(l => !HIDDEN_FOR_WORKERS.includes(l.name.toLowerCase())),
    [locations],
  )

  const rows = useMemo<CreateRowData[]>(
    () =>
      payrollData
        .filter(
          d =>
            (locationFilter === 0 || d.location === locationFilter) &&
            (!onlyEmpty || d.location === -1),
        )
        .flatMap(entry => {
          const row = info.get(entry.workerId)

          return row ? [{entry, info: row}] : []
        }),
    [payrollData, info, locationFilter, onlyEmpty],
  )

  const included = payrollData.filter(d => d.location !== -1)
  const withoutLocation = payrollData.length - included.length
  const payTotal = included.reduce((sum, d) => sum + rowTotal(d), 0)
  const moneyTotal = money.reduce((sum, d) => sum + (d.value || 0), 0)

  if (!ready) {
    return (
      <main className="flex flex-col gap-2 p-4">
        {Array.from({length: 8}, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </main>
    )
  }

  return (
    <main
      className={cn(
        'flex min-w-0 flex-col gap-3 p-4',
        'max-sm:h-[calc(100dvh-4rem)] sm:h-dvh',
      )}>
      <div className="flex shrink-0 flex-col gap-3">
        <CreateToolbar
          locationOptions={locationOptions}
          locationName={
            locationOptions.find(l => l.id === locationFilter)?.name ?? 'Все'
          }
          onLocationChange={name =>
            setLocationFilter(
              locationOptions.find(l => l.name === name)?.id ?? 0,
            )
          }
          onlyEmpty={onlyEmpty}
          onOnlyEmptyChange={setOnlyEmpty}
          isDistributing={isDistributing}
          onDistribute={distribute}
          periodLabel={interval.toFormat('dd.MM.yyyy')}
          bonuses={bonuses}
          moneyTotal={moneyTotal}
          moneyOpen={moneyOpen}
          onMoneyToggle={() => setMoneyOpen(open => !open)}
          takeBy={takeBy}
          onTakeByChange={setTakeBy}
          isSaving={isSaving}
          onSave={() => send(false)}
          onPublish={() => setConfirmPublish(true)}
        />
        {moneyOpen && (
          <div className="max-h-56 overflow-y-auto">
            <LocationsMoney
              locations={locations}
              hidden={HIDDEN_ON_MONEY}
              money={money}
              payrollData={payrollData}
              onChange={updateMoney}
            />
          </div>
        )}
      </div>

      <CreateTable
        rows={rows}
        locations={selectableLocations}
        onUpdate={update}
      />

      <Dialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Опубликовать ведомость?</DialogTitle>
            <DialogDescription>
              После публикации изменить состав ведомости нельзя.
            </DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">В ведомость попадёт</span>
              <span className="font-medium tabular-nums">
                {included.length} сотр.
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Сумма к выдаче</span>
              <span className="font-medium tabular-nums">
                {separateNumber(payTotal)} ₽
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                Выделено на площадки
              </span>
              <span className="font-medium tabular-nums">
                {separateNumber(moneyTotal)} ₽
              </span>
            </li>
            {withoutLocation > 0 && (
              <li className="text-warning">
                {withoutLocation} сотр. без площадки в ведомость не попадут
              </li>
            )}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPublish(false)}>
              Отмена
            </Button>
            <Button disabled={isSaving} onClick={() => send(true)}>
              Опубликовать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
