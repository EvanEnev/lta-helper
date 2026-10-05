'use client'

import {useState} from 'react'
import {CalendarDays} from 'lucide-react'
import {DateTime} from 'luxon'
import type {DateRange} from 'react-day-picker'
import {ru} from 'react-day-picker/locale'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {useIsMobile} from '@/hooks/use-mobile'

export interface DatePeriod {
  start: DateTime
  end: DateTime
}

interface DateRangePopoverProps {
  value: DatePeriod
  onChange: (value: DatePeriod) => void
  zone?: string
  // дополнительные быстрые периоды (например, полумесяцы)
  extraPresets?: {label: string; period: DatePeriod}[]
}

const toDate = (date: DateTime) => new Date(date.year, date.month - 1, date.day)

const fromDate = (date: Date, zone: string) =>
  DateTime.fromObject(
    {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()},
    {zone},
  )

// Период выбирается календарём или быстрыми кнопками
export default function DateRangePopover({
  value,
  onChange,
  zone = 'Europe/Moscow',
  extraPresets = [],
}: DateRangePopoverProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  // пока выбрана только первая дата, держим черновик локально
  const [draft, setDraft] = useState<DateRange | undefined>()

  const now = DateTime.now().setZone(zone)
  const presets: {label: string; period: DatePeriod}[] = [
    {
      label: 'Этот месяц',
      period: {start: now.startOf('month'), end: now.endOf('month')},
    },
    {
      label: 'Прошлый месяц',
      period: {
        start: now.minus({months: 1}).startOf('month'),
        end: now.minus({months: 1}).endOf('month'),
      },
    },
    {
      label: 'Квартал',
      period: {start: now.startOf('quarter'), end: now.endOf('quarter')},
    },
    {
      label: 'Год',
      period: {start: now.startOf('year'), end: now.endOf('year')},
    },
    ...extraPresets,
  ]

  const apply = (period: DatePeriod) => {
    onChange(period)
    setDraft(undefined)
    setOpen(false)
  }

  const selected = draft ?? {from: toDate(value.start), to: toDate(value.end)}

  return (
    <Popover
      open={open}
      onOpenChange={next => {
        setOpen(next)
        if (!next) setDraft(undefined)
      }}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label="Период"
            className="h-9 justify-start gap-2 font-normal"
          />
        }>
        <CalendarDays />
        {value.start.setLocale('ru').toFormat('dd.MM.yyyy')} –{' '}
        {value.end.setLocale('ru').toFormat('dd.MM.yyyy')}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-0 p-0">
        <div className="flex flex-wrap gap-1.5 border-b p-2">
          {presets.map(preset => (
            <Button
              key={preset.label}
              size="xs"
              variant="secondary"
              onClick={() => apply(preset.period)}>
              {preset.label}
            </Button>
          ))}
        </div>
        <Calendar
          mode="range"
          locale={ru}
          numberOfMonths={isMobile ? 1 : 2}
          selected={selected}
          defaultMonth={toDate(value.start)}
          onSelect={(range, triggerDate) => {
            // первый клик начинает период, второй завершает его
            if (!draft?.from || (draft.from && draft.to)) {
              setDraft({from: triggerDate, to: undefined})
              return
            }

            const from = draft.from <= triggerDate ? draft.from : triggerDate
            const to = draft.from <= triggerDate ? triggerDate : draft.from

            apply({start: fromDate(from, zone), end: fromDate(to, zone)})
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
