'use client'

import {useRef} from 'react'
import {Briefcase} from 'lucide-react'
import {useLongPress} from '@/src/hooks/useLongPress'
import {cn} from '@/lib/utils'
import {TONE_CLASSES, type ScheduleDay, type StatusMeta} from './utils'

interface DayTileProps {
  day: ScheduleDay
  status: StatusMeta | null
  isSelected: boolean
  isToday: boolean
  isPast: boolean
  isChanged: boolean
  showMonth: boolean
  onSelect: () => void
  onLongPress: () => void
}

const hasTime = (time?: string) => !!time && time !== 'Не указано'

export default function DayTile({
  day,
  status,
  isSelected,
  isToday,
  isPast,
  isChanged,
  showMonth,
  onSelect,
  onLongPress,
}: DayTileProps) {
  const longPressed = useRef(false)
  const longPress = useLongPress(() => {
    longPressed.current = true
    onLongPress()
  }, 400)

  const date = day.date.setLocale('ru')
  const shift = day.locationData.find(data => data.self)
  const StatusIcon = status?.icon

  return (
    <div
      className={cn(
        'ring-foreground/10 relative flex aspect-square min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl ring-1 transition-colors',
        'sm:aspect-auto sm:h-28 sm:items-stretch sm:justify-between sm:p-3',
        status ? TONE_CLASSES[status.tone].soft : 'bg-card hover:bg-muted',
        isPast && !isSelected && 'opacity-60',
        isSelected && 'ring-primary ring-2',
      )}>
      <button
        type="button"
        aria-pressed={isSelected}
        aria-label={date.toFormat('d MMMM, cccc')}
        {...longPress}
        onContextMenu={event => event.preventDefault()}
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false
            return
          }
          onSelect()
        }}
        className="focus-visible:ring-ring absolute inset-0 rounded-xl outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2"
      />

      <div className="pointer-events-none flex items-center gap-1.5">
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full text-base font-semibold tabular-nums sm:size-8 sm:text-xl',
            isToday && 'bg-primary text-primary-foreground',
          )}>
          {day.date.day}
        </span>
        {showMonth && (
          <span className="text-muted-foreground hidden text-xs uppercase sm:inline">
            {date.toFormat('LLL')}
          </span>
        )}
      </div>

      <div className="pointer-events-none flex h-4 items-center gap-1 sm:hidden">
        {StatusIcon && <StatusIcon className="size-4 shrink-0" />}
        {shift && (
          <Briefcase aria-label="Есть смена" className="size-3 opacity-70" />
        )}
      </div>
      {showMonth && (
        <span className="text-muted-foreground pointer-events-none absolute bottom-0.5 text-[9px] leading-none uppercase sm:hidden">
          {date.toFormat('LLL')}
        </span>
      )}

      <div className="pointer-events-none hidden min-w-0 flex-col gap-0.5 sm:flex">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {StatusIcon && <StatusIcon className="size-4 shrink-0" />}
          <span className="truncate">
            {status?.label ?? (
              <span className="text-muted-foreground/70 font-normal">
                Не указано
              </span>
            )}
          </span>
        </span>
        {shift && (
          <span className="text-foreground/70 flex items-center gap-1 text-xs">
            <Briefcase className="size-3 shrink-0" />
            <span className="truncate">
              {shift.locationName}
              {hasTime(shift.data?.time) && ` · ${shift.data?.time}`}
            </span>
          </span>
        )}
        {day.comment && (
          <span className="text-muted-foreground truncate text-xs italic">
            {day.comment}
          </span>
        )}
      </div>

      {isChanged && (
        <span
          title="Не отправлено"
          className="bg-primary pointer-events-none absolute top-1 right-1 size-2 rounded-full sm:top-3 sm:right-3"
        />
      )}
    </div>
  )
}
