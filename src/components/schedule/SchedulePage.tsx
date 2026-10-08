'use client'

import {useMemo, useState} from 'react'
import {Briefcase, ListChecks} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {useIsMobile} from '@/hooks/use-mobile'
import convertTZ from '@/lib/functions/convertTZ'
import fetchHandler from '@/src/utils/global/fetchHandler'
import {cn} from '@/lib/utils'
import type {LTLocation, LTWorker} from '@/src/utils/types'
import Changes, {type Change} from './ChangesCard'
import ActionBar from './ActionBar'
import DayEditor from './DayEditor'
import DayTile from './DayTile'
import ScheduleStats from './ScheduleStats'
import {
  getStatus,
  groupWeeks,
  needsComment,
  summarize,
  toScheduleDays,
  type ScheduleDayInput,
} from './utils'

interface SchedulePageProps {
  locations: LTLocation[]
  worker: LTWorker
  workingDays: ScheduleDayInput[]
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function SchedulePage({
  locations,
  worker,
  workingDays,
}: SchedulePageProps) {
  const isMobile = useIsMobile()
  const todayKey = convertTZ(new Date(), 'Europe/Moscow').toISODate()!
  const locationNames = useMemo(() => locations.map(l => l.name), [locations])

  const initial = useMemo(() => toScheduleDays(workingDays), [workingDays])
  const [source, setSource] = useState(workingDays)
  const [baseline, setBaseline] = useState(initial)
  const [days, setDays] = useState(initial)

  if (source !== workingDays) {
    setSource(workingDays)
    setBaseline(initial)
    setDays(initial)
  }

  const [selected, setSelected] = useState<string[]>(() =>
    initial.some(day => day.key === todayKey) ? [todayKey] : [],
  )
  const [multi, setMulti] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [isSending, setSending] = useState(false)

  const weeks = useMemo(() => groupWeeks(days), [days])
  const stats = useMemo(
    () => summarize(days, locationNames, todayKey),
    [days, locationNames, todayKey],
  )
  const selectedDays = days.filter(day => selected.includes(day.key))

  const changes: Change[] = useMemo(() => {
    const base = new Map(baseline.map(day => [day.key, day]))

    return days.flatMap(day => {
      const prev = base.get(day.key)
      const isChanged =
        day.value !== (prev?.value ?? '') ||
        day.comment !== (prev?.comment ?? '')

      return isChanged ? [{day, base: prev}] : []
    })
  }, [days, baseline])
  const changedKeys = useMemo(
    () => new Set(changes.map(change => change.day.key)),
    [changes],
  )

  const selectDay = (key: string) => {
    if (multi) {
      setSelected(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
      )
      return
    }

    setSelected([key])
  }

  const startMulti = (key: string) => {
    setMulti(true)
    setSelected(prev => (prev.includes(key) ? prev : [...prev, key]))
  }

  const selectWeek = (week: (typeof weeks)[number]) => {
    setMulti(true)
    setSelected(week.flatMap(day => (day ? [day.key] : [])))
  }

  const clearSelection = () => {
    setSelected([])
    setMulti(false)
    setEditorOpen(false)
  }

  const patch = (changes: {value?: string; comment?: string}) =>
    setDays(prev =>
      prev.map(day =>
        selected.includes(day.key) ? {...day, ...changes} : day,
      ),
    )

  const setStatus = (value: string) => {
    patch({value})

    if (
      needsComment(value, worker.rank) &&
      selectedDays.some(day => !day.comment.trim())
    ) {
      setEditorOpen(true)
    }
  }

  const send = async () => {
    const invalid = changes.filter(
      ({day}) => needsComment(day.value, worker.rank) && !day.comment.trim(),
    )

    if (invalid.length) {
      setShowErrors(true)
      setSelected(invalid.map(({day}) => day.key))
      if (isMobile) setEditorOpen(true)
      return
    }

    const sent = days
    setSending(true)

    try {
      const response = await fetchHandler({
        url: '/api/send',
        method: 'POST',
        body: {
          selectedDays: changes.map(({day}) => ({
            date: day.date.toISO(),
            value: day.value,
            comment: day.comment,
          })),
        },
      })

      if (response) {
        setBaseline(sent)
        setShowErrors(false)
      }
    } finally {
      setSending(false)
    }
  }

  const period = days.length
    ? `${days[0].date.toFormat('dd.MM')} – ${days[days.length - 1].date.toFormat('dd.MM')}`
    : ''

  const editor = (className?: string) => (
    <DayEditor
      days={selectedDays}
      worker={worker}
      showErrors={showErrors}
      onPatch={patch}
      onClear={clearSelection}
      className={className}
    />
  )

  return (
    <main className="mx-auto grid w-full max-w-[100rem] gap-4 p-4 max-md:pb-60 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <ScheduleStats {...stats} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">График</CardTitle>
            <CardDescription>
              Отметьте, когда можете работать{period && ` · ${period}`}
            </CardDescription>
            <CardAction>
              <Button
                variant={multi ? 'default' : 'outline'}
                size="sm"
                aria-pressed={multi}
                onClick={() => setMulti(prev => !prev)}>
                <ListChecks />
                Несколько
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {days.length ? (
              <div className="flex flex-col gap-3">
                <div className="text-muted-foreground grid grid-cols-7 gap-1.5 text-center text-xs sm:gap-2">
                  {WEEKDAYS.map((name, index) => (
                    <span
                      key={name}
                      className={cn(index > 4 && 'text-primary')}>
                      {name}
                    </span>
                  ))}
                </div>
                {weeks.map((week, index) => {
                  const first = week.find(Boolean)
                  const last = week.findLast(Boolean)

                  return (
                    <div
                      key={first?.key ?? index}
                      className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {first?.date.toFormat('dd.MM')} –{' '}
                          {last?.date.toFormat('dd.MM')}
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => selectWeek(week)}>
                          Выбрать неделю
                        </Button>
                      </div>
                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {week.map((day, slot) =>
                          day ? (
                            <DayTile
                              key={day.key}
                              day={day}
                              status={getStatus(day.value, locationNames)}
                              isSelected={selected.includes(day.key)}
                              isToday={day.key === todayKey}
                              isPast={day.key < todayKey}
                              isChanged={changedKeys.has(day.key)}
                              showMonth={
                                day.date.day === 1 || day.key === days[0].key
                              }
                              onSelect={() => selectDay(day.key)}
                              onLongPress={() => startMulti(day.key)}
                            />
                          ) : (
                            <span key={slot} />
                          ),
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Дат пока нет..
              </p>
            )}
            <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <li className="flex items-center gap-1.5">
                <Briefcase className="size-3.5" />
                Есть смена
              </li>
              <li className="flex items-center gap-1.5">
                <span className="bg-primary size-2 rounded-full" />
                Не отправлено
              </li>
              <li>Удерживайте день, чтобы выбрать несколько</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
        <Card>
          <CardContent className="flex flex-col gap-5">
            <div className="hidden md:block">{editor()}</div>
            <Separator className="hidden md:block" />
            <Changes
              changes={changes}
              locationNames={locationNames}
              isPending={isSending}
              onSend={send}
            />
          </CardContent>
        </Card>
      </aside>

      <ActionBar
        days={selectedDays}
        changesCount={changes.length}
        isSending={isSending}
        onStatus={setStatus}
        onComment={() => setEditorOpen(true)}
        onClear={clearSelection}
        onSend={send}
      />

      {isMobile && (
        <Drawer open={editorOpen} onOpenChange={setEditorOpen}>
          <DrawerContent>
            <DrawerHeader className="sr-only">
              <DrawerTitle>Редактирование дня</DrawerTitle>
            </DrawerHeader>
            <div
              data-base-ui-swipe-ignore
              className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain p-3">
              {editor()}
              <DrawerFooter className="p-0">
                <Button size="lg" onClick={() => setEditorOpen(false)}>
                  Готово
                </Button>
              </DrawerFooter>
              <div
                aria-hidden
                className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0"
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </main>
  )
}
