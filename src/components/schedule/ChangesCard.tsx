import {ArrowRight} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {cn} from '@/lib/utils'
import SendButton from './SendButton'
import {TONE_CLASSES, getStatus, type ScheduleDay} from './utils'

export interface Change {
  day: ScheduleDay
  base?: ScheduleDay
}

interface ChangesProps {
  changes: Change[]
  locationNames: string[]
  isPending: boolean
  onSend: () => void
  className?: string
}

function StatusLabel({
  value,
  locationNames,
}: {
  value: string
  locationNames: string[]
}) {
  const status = getStatus(value, locationNames)

  if (!status) {
    return <span className="text-muted-foreground">не указано</span>
  }

  return (
    <span
      className={cn('flex items-center gap-1', TONE_CLASSES[status.tone].text)}>
      <status.icon className="size-4" />
      {status.label}
    </span>
  )
}

export default function Changes({
  changes,
  locationNames,
  isPending,
  onSend,
  className,
}: ChangesProps) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <div>
        <h2 className="flex items-center gap-2 text-lg font-medium">
          Изменения
          {changes.length > 0 && <Badge>{changes.length}</Badge>}
        </h2>
        <p className="text-muted-foreground text-sm">
          Отправляются старшему и в топик «График»
        </p>
      </div>

      {changes.length ? (
        <ul className="flex flex-col divide-y">
          {changes.map(({day, base}) => (
            <li
              key={day.key}
              className="flex items-start justify-between gap-3 py-2.5 text-sm">
              <span className="font-medium tabular-nums">
                {day.date.setLocale('ru').toFormat('dd.MM')}
                <span className="text-muted-foreground font-normal">
                  {' '}
                  {day.date.setLocale('ru').toFormat('ccc')}
                </span>
              </span>
              <div className="flex min-w-0 flex-col items-end gap-1">
                <span className="flex items-center gap-1.5">
                  {base?.value && base.value !== day.value && (
                    <>
                      <StatusLabel
                        value={base.value}
                        locationNames={locationNames}
                      />
                      <ArrowRight className="text-muted-foreground size-3.5" />
                    </>
                  )}
                  <StatusLabel
                    value={day.value}
                    locationNames={locationNames}
                  />
                </span>
                {day.comment && (
                  <span className="text-muted-foreground max-w-full text-right break-words">
                    «{day.comment}»
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground rounded-lg border border-dashed py-4 text-center text-sm">
          Пока ничего не изменено
        </p>
      )}

      <div className="hidden md:block">
        <SendButton
          count={changes.length}
          isPending={isPending}
          onClick={onSend}
        />
      </div>
    </section>
  )
}
