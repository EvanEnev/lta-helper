'use client'

import {memo} from 'react'
import {Clock, Gamepad2, MessageSquare, Minus, Plus, Wallet} from 'lucide-react'
import {cn} from '@/lib/utils'
import {hasContent, summarizeDay, type DayData} from './utils'

const nf = new Intl.NumberFormat('ru-RU')

interface DayCellProps {
  data?: DayData
  workerId: number
  dayKey: string
  label?: number
  review: boolean
  isToday: boolean
  variant: 'table' | 'calendar'
  onOpen: (workerId: number, dayKey: string) => void
}

function Tag({
  icon: Icon,
  value,
  className,
}: {
  icon: typeof Clock
  value: number
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-0.5 tabular-nums',
        className,
      )}>
      <Icon className="size-3" />
      {nf.format(value)}
    </span>
  )
}

export default memo(function DayCell({
  data,
  workerId,
  dayKey,
  label,
  review,
  isToday,
  variant,
  onOpen,
}: DayCellProps) {
  const isCalendar = variant === 'calendar'
  const size = isCalendar
    ? 'h-16 sm:h-24'
    : review
      ? 'h-[6.25rem]'
      : 'h-[4.5rem]'

  if (!hasContent(data)) {
    return (
      <div
        className={cn(
          'border-border bg-muted/25 w-full rounded-lg border p-1.5 text-[11px]',
          size,
          isToday && 'border-success/60',
        )}>
        {label !== undefined && (
          <span className="text-muted-foreground/60">{label}</span>
        )}
      </div>
    )
  }

  const cell = data!
  const summary = summarizeDay(cell)
  const isShift = !!cell.id
  const color = cell.location?.color

  return (
    <button
      type="button"
      onClick={() => onOpen(workerId, dayKey)}
      aria-label={`${dayKey}: ${isShift ? `${cell.value} ₽` : 'выплата'}`}
      style={color ? {borderLeftColor: color} : undefined}
      className={cn(
        'bg-card hover:bg-muted focus-visible:ring-ring flex w-full flex-col gap-0.5 overflow-hidden rounded-lg border border-l-[3px] p-1.5 text-left text-xs transition-colors outline-none focus-visible:ring-2',
        size,
        isToday && 'ring-success/60 ring-1',
      )}>
      <span className="flex items-center justify-between gap-1">
        <span
          className={cn(
            'font-semibold tabular-nums',
            isCalendar ? 'text-xs sm:text-sm' : 'text-sm',
          )}>
          {isShift ? (
            `${nf.format(Number(cell.value) || 0)} ₽`
          ) : (
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <Wallet className="size-3.5" />
              {nf.format(summary.payments)}
            </span>
          )}
        </span>
        {isCalendar && label !== undefined ? (
          <span className="text-muted-foreground text-[11px]">{label}</span>
        ) : (
          summary.hasComment && (
            <MessageSquare className="text-muted-foreground size-3 shrink-0" />
          )
        )}
      </span>

      {isShift && (
        <span
          className={cn(
            'text-muted-foreground truncate',
            isCalendar && 'max-sm:hidden',
          )}>
          {cell.type ||
            `${cell.startTime?.slice(0, 5)}–${cell.endTime?.slice(0, 5)}`}
        </span>
      )}

      <span
        className={cn(
          'flex flex-wrap gap-x-1.5 overflow-hidden text-[11px] leading-tight',
          isCalendar && 'max-sm:hidden',
        )}>
        {summary.overwork > 0 && <Tag icon={Clock} value={summary.overwork} />}
        {summary.games + summary.actorGames > 0 && (
          <Tag icon={Gamepad2} value={summary.games + summary.actorGames} />
        )}
        {summary.bonuses !== 0 && (
          <Tag icon={Plus} value={summary.bonuses} className="text-success" />
        )}
        {summary.fines !== 0 && (
          <Tag
            icon={Minus}
            value={Math.abs(summary.fines)}
            className="text-destructive"
          />
        )}
        {isShift && summary.payments > 0 && (
          <Tag icon={Wallet} value={summary.payments} />
        )}
      </span>

      {review && isShift && !cell.type && !isCalendar && (
        <span className="text-muted-foreground mt-auto truncate text-[10px] tabular-nums">
          {(['oneGames', 'twoGames', 'threeGames', 'actorGames'] as const)
            .map(key => `${cell[key]?.value ?? 0}(${cell[key]?.number ?? 0})`)
            .join(' ')}
        </span>
      )}
    </button>
  )
})
