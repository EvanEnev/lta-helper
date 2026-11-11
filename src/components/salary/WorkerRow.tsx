'use client'

import {memo, useMemo} from 'react'
import RankIcon from '@/src/components/global/RankIcon'
import type {UserSalary} from '@/src/utils/types'
import DayCard from './DayCard'
import DayCell from './DayCell'
import {indexByDay} from './utils'

interface WorkerRowProps {
  row: UserSalary
  days: string[]
  today: string | null
  review: boolean
  density: 'full' | 'compact'
  template: string
  onOpen: (workerId: number, dayKey: string) => void
}

export default memo(function WorkerRow({
  row,
  days,
  today,
  review,
  density,
  template,
  onOpen,
}: WorkerRowProps) {
  const byDay = useMemo(() => indexByDay(row.dates), [row.dates])
  const {worker} = row

  return (
    <div
      role="row"
      className="border-border/60 grid gap-1.5 border-b py-1"
      style={{gridTemplateColumns: template}}>
      <div
        role="rowheader"
        className="bg-background border-border sticky left-0 z-10 flex min-w-0 items-center gap-2 border-r pr-1.5 pl-3">
        <RankIcon
          rank={worker.rank}
          className="h-8 w-auto shrink-0 max-md:hidden"
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-medium">{worker.name}</p>
          {worker.firstName && (
            <p className="text-muted-foreground truncate text-xs max-md:hidden">
              {worker.firstName}
            </p>
          )}
          {worker.isFormer && (
            <p className="text-muted-foreground truncate text-[11px]">Бывший</p>
          )}
        </div>
      </div>
      {days.map(day => (
        <div role="cell" key={day} className="flex min-w-0">
          {density === 'full' ? (
            <DayCard
              data={byDay.get(day)}
              workerId={worker.id}
              dayKey={day}
              review={review}
              isToday={day === today}
              onOpen={onOpen}
            />
          ) : (
            <DayCell
              data={byDay.get(day)}
              workerId={worker.id}
              dayKey={day}
              review={review}
              isToday={day === today}
              variant="table"
              onOpen={onOpen}
            />
          )}
        </div>
      ))}
    </div>
  )
})
