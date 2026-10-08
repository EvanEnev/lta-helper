'use client'

import {useState} from 'react'
import {CalendarDays} from 'lucide-react'
import {DateTime} from 'luxon'
import {ru} from 'react-day-picker/locale'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {ZONE, isDateAllowed, nowInZone} from './utils'

interface DateFieldProps {
  value: DateTime
  canEditAll: boolean
  onChange: (date: DateTime) => void
}

const toZoned = (date: Date) =>
  DateTime.fromObject(
    {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()},
    {zone: ZONE},
  )

export default function DateField({
  value,
  canEditAll,
  onChange,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const today = nowInZone().startOf('day')
  const yesterday = today.minus({days: 1})
  const tomorrow = today.plus({days: 1})

  const select = (date: DateTime) => {
    if (!isDateAllowed(date, canEditAll)) return

    onChange(date)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="lg"
              aria-label="Дата"
              className="h-10 w-full justify-start gap-2 font-normal"
            />
          }>
          <CalendarDays />
          {value.setLocale('ru').toFormat('d MMMM yyyy, ccc')}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            locale={ru}
            selected={new Date(value.year, value.month - 1, value.day)}
            defaultMonth={new Date(value.year, value.month - 1, value.day)}
            disabled={date => !isDateAllowed(toZoned(date), canEditAll)}
            onSelect={date => date && select(toZoned(date))}
          />
        </PopoverContent>
      </Popover>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!isDateAllowed(yesterday, canEditAll)}
          onClick={() => select(yesterday)}>
          Вчера
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!isDateAllowed(today, canEditAll)}
          onClick={() => select(today)}>
          Сегодня
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!isDateAllowed(tomorrow, canEditAll)}
          onClick={() => select(tomorrow)}>
          Завтра
        </Button>
      </div>
    </div>
  )
}
