'use client'

import {useEffect, useState} from 'react'
import LazyMount from '@/src/components/global/LazyMount'
import {cn} from '@/lib/utils'
import type {UserSalary} from '@/src/utils/types'
import WorkerRow from './WorkerRow'

interface SalaryTableProps {
  rows: UserSalary[]
  days: string[]
  today: string | null
  review: boolean
  density: 'full' | 'compact'
  scrollSignal: number // меняется, когда нужно прокрутить к сегодняшнему дню
  monthKey: string
  isLoading: boolean
  onOpen: (workerId: number, dayKey: string) => void
}

// ориентиры высоты строки, пока она не создана (чтобы полоса прокрутки не прыгала)
const ROW_HEIGHT = {
  compact: 84,
  compactReview: 112,
  full: 300,
  fullReview: 340,
  empty: 56,
}

// Прокручиваемая таблица: шапка и колонка сотрудников «прилипают».
// Строки создаются по мере прокрутки (LazyMount), а не все сразу
export default function SalaryTable({
  rows,
  days,
  today,
  review,
  density,
  scrollSignal,
  monthKey,
  isLoading,
  onOpen,
}: SalaryTableProps) {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const template = `var(--name-w) repeat(${days.length}, var(--cell-w))`

  // к сегодняшнему дню - при смене месяца и по кнопке
  useEffect(() => {
    if (!scroller || !today || isLoading) return

    const header = scroller.querySelector<HTMLElement>(`[data-day="${today}"]`)
    const name = scroller.querySelector<HTMLElement>('[data-corner]')
    if (!header) return

    scroller.scrollTo({
      left: header.offsetLeft - (name?.offsetWidth ?? 0) - 8,
      behavior: scrollSignal ? 'smooth' : 'auto',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroller, scrollSignal, monthKey, isLoading])

  return (
    <div
      ref={setScroller}
      role="table"
      aria-label="Зарплаты по дням"
      className={cn(
        // [contain:inline-size]: ширина области не зависит от содержимого, иначе корневой
        // min-w-fit растягивает всю страницу и прокрутка/липкая колонка не работают
        'relative min-h-0 flex-1 overflow-auto rounded-xl border [contain:inline-size]',
        '[--name-w:6.5rem] md:[--name-w:11rem]',
        density === 'full'
          ? '[--cell-w:16rem] md:[--cell-w:17rem]'
          : '[--cell-w:6.5rem] md:[--cell-w:8rem]',
        isLoading && 'opacity-60 transition-opacity',
      )}>
      <div className="min-w-max">
        <div
          role="row"
          className="bg-background sticky top-0 z-20 grid gap-1.5 border-b py-1.5"
          style={{gridTemplateColumns: template}}>
          <div
            data-corner
            role="columnheader"
            className="bg-background text-muted-foreground sticky left-0 z-30 flex items-center pl-3 text-xs">
            Сотрудник
          </div>
          {days.map(day => (
            <div
              key={day}
              data-day={day}
              role="columnheader"
              className={cn(
                'rounded-md py-1 text-center text-sm tabular-nums',
                day === today
                  ? 'bg-success/15 text-success font-semibold'
                  : 'text-muted-foreground',
              )}>
              {day}
            </div>
          ))}
        </div>

        {rows.map(row => (
          <LazyMount
            key={row.worker.id}
            root={scroller}
            minHeight={
              !row.dates.length
                ? ROW_HEIGHT.empty
                : density === 'full'
                  ? review
                    ? ROW_HEIGHT.fullReview
                    : ROW_HEIGHT.full
                  : review
                    ? ROW_HEIGHT.compactReview
                    : ROW_HEIGHT.compact
            }>
            <WorkerRow
              row={row}
              days={days}
              today={today}
              review={review}
              density={density}
              template={template}
              onOpen={onOpen}
            />
          </LazyMount>
        ))}
      </div>
    </div>
  )
}
