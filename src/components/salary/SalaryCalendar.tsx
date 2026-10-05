'use client'

import {useMemo} from 'react'
import type {UserSalary} from '@/src/utils/types'
import DayCell from './DayCell'
import {indexByDay, monthWeeks} from './utils'

interface SalaryCalendarProps {
  row?: UserSalary
  date: string
  today: string | null
  review: boolean
  onOpen: (workerId: number, dayKey: string) => void
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Для сотрудника, который видит только свои данные: месяц календарём
export default function SalaryCalendar({
  row,
  date,
  today,
  review,
  onOpen,
}: SalaryCalendarProps) {
  const weeks = useMemo(() => monthWeeks(date), [date])
  const byDay = useMemo(() => indexByDay(row?.dates ?? []), [row?.dates])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-muted-foreground grid grid-cols-7 gap-1.5 text-center text-xs sm:gap-2">
        {WEEKDAYS.map((name, index) => (
          <span key={name} className={index > 4 ? 'text-primary' : undefined}>
            {name}
          </span>
        ))}
      </div>
      {weeks.map((week, index) => (
        <div key={index} className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {week.map((day, slot) =>
            day ? (
              <DayCell
                key={day}
                data={byDay.get(day)}
                workerId={row?.worker.id ?? 0}
                dayKey={day}
                label={Number(day.slice(0, 2))}
                review={review}
                isToday={day === today}
                variant="calendar"
                onOpen={onOpen}
              />
            ) : (
              <span key={slot} />
            ),
          )}
        </div>
      ))}
    </div>
  )
}
