'use client'

import {useId} from 'react'
import {X} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {Separator} from '@/components/ui/separator'
import Location from '@/src/components/global/Location'
import RankIcon from '@/src/components/global/RankIcon'
import sortByRank from '@/lib/functions/sortByRank'
import checkPermissions from '@/lib/functions/checkPermissions'
import {cn} from '@/lib/utils'
import type {LocationData, LTWorker} from '@/src/utils/types'
import {
  COMMENT_TEMPLATES,
  STATUSES,
  TONE_CLASSES,
  locationStatus,
  needsComment,
  type ScheduleDay,
} from './utils'

interface DayEditorProps {
  days: ScheduleDay[]
  worker: LTWorker
  showErrors: boolean
  onPatch: (patch: {value?: string; comment?: string}) => void
  onClear: () => void
  className?: string
}

const pluralDays = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня'
  return 'дней'
}

function Colleagues({locationData}: {locationData: LocationData[]}) {
  const groups = new Map<string, LocationData[]>()
  for (const item of locationData) {
    groups.set(item.locationName, [
      ...(groups.get(item.locationName) ?? []),
      item,
    ])
  }

  return (
    <Accordion className="rounded-lg border px-3">
      {[...groups.entries()].map(([locationName, items]) => {
        const self = items.find(item => item.self)
        const people = sortByRank(
          items.flatMap(item =>
            item.data
              ? [
                  {
                    name: item.data.worker,
                    rank: item.data.rank,
                    role: item.data.role,
                    time: item.data.time,
                  },
                ]
              : [],
          ),
        )

        return (
          <AccordionItem key={locationName} value={locationName}>
            <AccordionTrigger className="items-center">
              <span className="flex items-center gap-2">
                <Location locationName={locationName} className="w-fit" />
                {self?.data && (
                  <span className="text-muted-foreground">
                    / {self.data.time}
                  </span>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col divide-y">
                {people.map(person => (
                  <li key={person.name} className="flex flex-col gap-0.5 py-2">
                    <span className="flex flex-wrap items-center gap-2">
                      <RankIcon
                        rank={person.rank || ''}
                        className="h-6 w-auto"
                      />
                      <span>{person.name}</span>
                      <span className="text-muted-foreground">
                        / {person.time}
                      </span>
                    </span>
                    {person.role && (
                      <span className="text-muted-foreground">
                        Роль: {person.role}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export default function DayEditor({
  days,
  worker,
  showErrors,
  onPatch,
  onClear,
  className,
}: DayEditorProps) {
  const commentId = useId()
  const isAdmin = checkPermissions(['set_location_schedule'], worker)

  const single = days.length === 1 ? days[0] : null
  const values = new Set(days.map(day => day.value))
  const comments = new Set(days.map(day => day.comment))
  const value = values.size === 1 ? days[0].value : null
  const comment = comments.size === 1 ? days[0].comment : ''

  const options = [...STATUSES]
  if (isAdmin && worker.location) options.push(locationStatus(worker.location))

  const isRequired = days.some(day => needsComment(day.value, worker.rank))
  const isInvalid =
    showErrors &&
    days.some(
      day => needsComment(day.value, worker.rank) && !day.comment.trim(),
    )

  const title = single
    ? single.date.setLocale('ru').toFormat('cccc, d MMMM')
    : `Выбрано: ${days.length} ${pluralDays(days.length)}`

  if (!days.length) {
    return (
      <p
        className={cn(
          'text-muted-foreground py-6 text-center text-sm',
          className,
        )}>
        Выберите день в календаре, чтобы отметить, можете ли вы работать
      </p>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-medium first-letter:uppercase">{title}</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Снять выбор"
          onClick={onClear}>
          <X />
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2" role="group" aria-label="Статус">
          {options.map(option => {
            const active = value === option.value

            return (
              <Button
                key={option.value}
                variant="outline"
                size="lg"
                aria-pressed={active}
                onClick={() => onPatch({value: option.value})}
                className={cn(
                  'h-11 justify-start gap-3 px-3 text-base [&_svg]:size-5',
                  TONE_CLASSES[option.tone].icon,
                  active && TONE_CLASSES[option.tone].active,
                )}>
                <option.icon />
                {option.label}
              </Button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={commentId} className="text-sm font-medium">
            {value === '-' ? 'Причина' : 'Комментарий'}
            {isRequired && <span className="text-destructive"> *</span>}
          </label>
          <Input
            id={commentId}
            value={comment}
            aria-invalid={isInvalid}
            placeholder={comments.size > 1 ? 'Разные комментарии' : ''}
            onChange={event => onPatch({comment: event.target.value})}
          />
          {isInvalid && (
            <p className="text-destructive text-sm">
              Укажите причину или комментарий
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {COMMENT_TEMPLATES.map(template => (
              <Button
                key={template}
                size="sm"
                variant={comment === template ? 'secondary' : 'outline'}
                onClick={() => onPatch({comment: template})}>
                {template}
              </Button>
            ))}
          </div>
        </div>

        {single && single.locationData.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Кто работает</p>
              <Colleagues locationData={single.locationData} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
