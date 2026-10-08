'use client'

import {useState} from 'react'
import {CalendarDays, X} from 'lucide-react'
import {DateTime} from 'luxon'
import type {DateRange} from 'react-day-picker'
import {ru} from 'react-day-picker/locale'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {useIsMobile} from '@/hooks/use-mobile'
import type {DatePeriod} from '@/src/components/global/DateRangePopover'

interface DateRangeFieldProps {
  label: string
  value: DatePeriod | null
  onChange: (value: DatePeriod | null) => void
  clearable?: boolean
}

const ZONE = 'Europe/Moscow'

const toDate = (date: DateTime) => new Date(date.year, date.month - 1, date.day)

const fromDate = (date: Date) =>
  DateTime.fromObject(
    {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()},
    {zone: ZONE},
  )

export default function DateRangeField({
  label,
  value,
  onChange,
  clearable,
}: DateRangeFieldProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>()

  const selected =
    draft ??
    (value ? {from: toDate(value.start), to: toDate(value.end)} : undefined)

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-2">
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
                aria-label={label}
                className="h-9 flex-1 justify-start gap-2 font-normal"
              />
            }>
            <CalendarDays />
            {value ? (
              `${value.start.toFormat('dd.MM.yyyy')} – ${value.end.toFormat('dd.MM.yyyy')}`
            ) : (
              <span className="text-muted-foreground">Не выбрано</span>
            )}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="range"
              locale={ru}
              numberOfMonths={isMobile ? 1 : 2}
              selected={selected}
              defaultMonth={value ? toDate(value.start) : undefined}
              onSelect={(_range, trigger) => {
                if (!draft?.from || (draft.from && draft.to)) {
                  setDraft({from: trigger, to: undefined})
                  return
                }

                const from = draft.from <= trigger ? draft.from : trigger
                const to = draft.from <= trigger ? trigger : draft.from

                onChange({start: fromDate(from), end: fromDate(to)})
                setDraft(undefined)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        {clearable && (
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            aria-label={`Очистить: ${label}`}
            disabled={!value}
            onClick={() => onChange(null)}>
            <X />
          </Button>
        )}
      </div>
    </div>
  )
}
