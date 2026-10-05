'use client'

import {useMemo, useState} from 'react'
import Link from 'next/link'
import {DateTime} from 'luxon'
import {Loader2, Plus} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type {DatePeriod} from '@/src/components/global/DateRangePopover'
import DateRangeField from './DateRangeField'

const ZONE = 'Europe/Moscow'

const fmt = (date: DateTime) => date.toFormat('yyyy-MM-dd')
const period = (start: DateTime, end: DateTime): DatePeriod => ({start, end})

// Диапазоны по умолчанию зависят от числа: с 26-го по 9-е - период 16-конец,
// с 10-го по 25-е - период 1-15 (бонусы инструкторов за прошлый месяц)
export function defaultRanges(now: DateTime) {
  if (now.day > 25 || now.day < 10) {
    const base = now.day < 5 ? now.minus({months: 1}) : now
    const dates = period(base.set({day: 16}), base.endOf('month'))

    return {
      dates,
      actors: dates,
      workers: null as DatePeriod | null,
      bonuses: false,
    }
  }

  const dates = period(now.set({day: 1}), now.set({day: 15}))
  const prev = now.minus({months: 1})

  return {
    dates,
    actors: dates,
    workers: period(prev.startOf('month'), prev.endOf('month')),
    bonuses: true,
  }
}

const range = (value: DatePeriod | null) => ({
  start: value ? fmt(value.start) : null,
  end: value ? fmt(value.end) : null,
})

export default function PayrollCreateDialog() {
  const defaults = useMemo(
    () => defaultRanges(DateTime.now().setZone(ZONE)),
    [],
  )

  const [dates, setDates] = useState<DatePeriod | null>(defaults.dates)
  const [actors, setActors] = useState<DatePeriod | null>(defaults.actors)
  const [workers, setWorkers] = useState<DatePeriod | null>(defaults.workers)
  const [isPending, setPending] = useState(false)
  // черновик читаем при открытии: на сервере localStorage нет
  const [hasDraft, setHasDraft] = useState(false)

  const query = (bonuses: boolean) => ({
    dates: JSON.stringify(range(dates)),
    moneyOnLocations: JSON.stringify([]),
    bonuses,
    workersBonusesRange: JSON.stringify(range(workers)),
    actorsBonusesRange: JSON.stringify(range(actors)),
  })

  const canContinue = !!dates && !!actors

  return (
    <Dialog
      onOpenChange={open => {
        if (!open) return

        try {
          setHasDraft(!!localStorage.getItem('payrollsCreate'))
        } catch {
          setHasDraft(false)
        }
      }}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="h-full min-h-56 w-full flex-col gap-2 border-2 border-dashed text-xl"
          />
        }>
        <Plus className="size-12" />
        Создать
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создание ведомости</DialogTitle>
          <DialogDescription>
            Выберите период и диапазоны, за которые считаются бонусы
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <DateRangeField
            label="Диапазон дат"
            value={dates}
            onChange={setDates}
          />
          <DateRangeField
            label="Бонусы актёров"
            value={actors}
            onChange={setActors}
            clearable
          />
          <DateRangeField
            label="Бонусы инструкторов"
            value={workers}
            onChange={setWorkers}
            clearable
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {hasDraft && (
            <Button
              variant="outline"
              disabled={!canContinue || isPending}
              nativeButton={false}
              render={
                <Link
                  href={{
                    pathname: '/payrolls/create',
                    query: query(defaults.bonuses),
                  }}
                  onClick={() => setPending(true)}
                />
              }>
              Продолжить черновик
            </Button>
          )}
          <Button
            disabled={!canContinue || isPending}
            nativeButton={false}
            render={
              <Link
                href={{
                  pathname: '/payrolls/create',
                  query: query(!!workers),
                }}
                onClick={() => {
                  setPending(true)
                  try {
                    localStorage.removeItem('payrollsCreate')
                  } catch {}
                }}
              />
            }>
            {isPending && <Loader2 className="animate-spin" />}
            Продолжить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
