'use client'

import {memo, type ReactNode} from 'react'
import {ChevronRight} from 'lucide-react'
import LocationIcon from '@/src/components/global/LocationIcon'
import {cn} from '@/lib/utils'
import {
  evalExpr,
  hasContent,
  summarizeDay,
  visiblePayments,
  type DayData,
} from './utils'

const nf = new Intl.NumberFormat('ru-RU')
const rub = (value: unknown) => `${nf.format(Number(value) || 0)} ₽`

interface DayCardProps {
  data?: DayData
  workerId: number
  dayKey: string
  showDate?: boolean
  review: boolean
  isToday: boolean
  onOpen: (workerId: number, dayKey: string) => void
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-muted-foreground text-[10px] tracking-wide uppercase">
        {label}
      </dt>
      <dd className="truncate text-xs tabular-nums">{children}</dd>
    </div>
  )
}

const markTime = (timestamp: string | undefined, dayKey: string) => {
  if (!timestamp) return '—'

  return timestamp.startsWith(dayKey) ? timestamp.slice(11) : timestamp
}

export default memo(function DayCard({
  data,
  workerId,
  dayKey,
  showDate,
  review,
  isToday,
  onOpen,
}: DayCardProps) {
  if (!hasContent(data)) {
    return (
      <div
        className={cn(
          'border-border bg-muted/25 h-full min-h-12 w-full rounded-lg border',
          isToday && 'border-success/60',
        )}
      />
    )
  }

  const cell = data!
  const summary = summarizeDay(cell)
  const payments = visiblePayments(cell)
  const isShift = !!cell.id
  const color = cell.location?.color
  const marks = cell.faceId ?? []

  const open = () => onOpen(workerId, dayKey)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      }}
      className={cn(
        'bg-card hover:bg-muted/50 focus-visible:ring-ring group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-colors outline-none focus-visible:ring-2',
        isToday && 'ring-success/60 ring-1',
      )}>
      <div
        className="flex items-center gap-2 px-2.5 py-1.5"
        style={{
          backgroundColor: color
            ? `color-mix(in srgb, ${color} 24%, transparent)`
            : undefined,
        }}>
        {cell.location && (
          <LocationIcon
            locationName={cell.location.name}
            className="h-5 shrink-0"
          />
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">
            {cell.location?.name ?? 'Внешняя выплата'}
            {showDate && (
              <span className="text-muted-foreground font-normal">
                {' '}
                · {dayKey}
              </span>
            )}
          </p>
          {isShift && (cell.createdBy || cell.createdAt) && (
            <p
              className="text-muted-foreground truncate text-[10px]"
              title="Кто и когда проставил">
              {cell.createdBy} {cell.createdAt}
            </p>
          )}
        </div>
        <ChevronRight className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100" />
      </div>

      {isShift && (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 p-2.5">
          {cell.type && (
            <p className="bg-muted col-span-2 rounded-md px-2 py-1 text-center text-xs">
              {cell.type}
            </p>
          )}

          <Field label="Смена">
            {cell.type ? (
              rub(cell.value)
            ) : (
              <>
                {cell.startTime?.slice(0, 5)}–{cell.endTime?.slice(0, 5)}
              </>
            )}
          </Field>
          <Field label={cell.type ? 'Сумма' : 'Сумма смены'}>
            {rub(cell.value)}
          </Field>

          {!cell.type && (
            <>
              <Field label="Переработка">
                {cell.overworkStart && cell.overworkEnd
                  ? `${cell.overworkStart.slice(0, 5)}–${cell.overworkEnd.slice(0, 5)}`
                  : '—'}
              </Field>
              <Field label="Сумма перераб.">{rub(cell.overworkValue)}</Field>

              {review ? (
                (
                  [
                    ['oneGames', '1 час'],
                    ['twoGames', '2 час'],
                    ['threeGames', '3 час'],
                    ['actorGames', 'Акт. час'],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    {cell[key]?.value ?? 0} ({cell[key]?.number ?? 0})
                  </Field>
                ))
              ) : (
                <>
                  <Field label="Проведение">{rub(summary.games)}</Field>
                  <Field label="Актёрские">{rub(summary.actorGames)}</Field>
                </>
              )}

              <Field label="Вход">
                {markTime(marks[0]?.timestamp, dayKey)}
              </Field>
              <Field label="Выход">
                {markTime(marks[marks.length - 1]?.timestamp, dayKey)}
              </Field>
            </>
          )}

          <Field label="Бонусы" className="col-span-1">
            <span title={cell.bonuses ?? ''}>
              {nf.format(evalExpr(cell.bonuses))}
              {cell.bonuses &&
                cell.bonuses !== String(evalExpr(cell.bonuses)) && (
                  <span className="text-muted-foreground">
                    {' '}
                    ({cell.bonuses})
                  </span>
                )}
            </span>
          </Field>
          <Field label="Штрафы" className="col-span-1">
            <span title={cell.fines ?? ''}>
              {nf.format(evalExpr(cell.fines))}
              {cell.fines && cell.fines !== String(evalExpr(cell.fines)) && (
                <span className="text-muted-foreground"> ({cell.fines})</span>
              )}
            </span>
          </Field>

          {summary.hasComment && (
            <div className="col-span-2 min-w-0">
              <dt className="text-muted-foreground text-[10px] tracking-wide uppercase">
                Комментарий
              </dt>
              <dd className="line-clamp-2 text-xs" title={cell.comment ?? ''}>
                {cell.comment}
              </dd>
            </div>
          )}
        </dl>
      )}

      {payments.length > 0 && (
        <ul
          className={cn(
            'flex flex-col gap-1 px-2.5 pb-2.5 text-xs',
            !isShift && 'pt-2.5',
            isShift && 'border-t pt-2',
          )}>
          {payments.map((payment, index) => (
            <li key={index} className="min-w-0">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground truncate">
                  Внешняя выплата: {payment.name}
                </span>
                <span className="font-medium tabular-nums">
                  {rub(payment.value)}
                </span>
              </div>
              {payment.comment && (
                <p className="text-muted-foreground line-clamp-1 text-[11px]">
                  {payment.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})
