'use client'

import {useMemo} from 'react'
import type {UserSalary} from '@/src/utils/types'
import DayCard from './DayCard'
import {dayKeys, hasContent, indexByDay} from './utils'

interface SalaryListProps {
  row?: UserSalary
  date: string
  today: string | null
  review: boolean
  onOpen: (workerId: number, dayKey: string) => void
}

// Для сотрудника, который видит только свои данные: полные карточки дней
export default function SalaryList({
  row,
  date,
  today,
  review,
  onOpen,
}: SalaryListProps) {
  const cards = useMemo(() => {
    const byDay = indexByDay(row?.dates ?? [])

    return dayKeys(date).flatMap(day => {
      const data = byDay.get(day)

      return hasContent(data) ? [{day, data}] : []
    })
  }, [row?.dates, date])

  if (!cards.length) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        За этот месяц данных нет
      </p>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-2">
      {cards.map(({day, data}) => (
        <DayCard
          key={day}
          data={data}
          workerId={row?.worker.id ?? 0}
          dayKey={day}
          showDate
          review={review}
          isToday={day === today}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
