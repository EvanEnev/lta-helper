'use client'

import {useState} from 'react'
import {CalendarDays} from 'lucide-react'
import {DateTime} from 'luxon'
import {ru} from 'react-day-picker/locale'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'

interface DatePopoverProps {
  value: string // yyyy-MM-dd
  onChange: (value: string) => void
  label?: string
  className?: string
}

// Calendar отдаёт локальные Date; наружу - строка yyyy-MM-dd
export default function DatePopover({
  value,
  onChange,
  label = 'Дата',
  className,
}: DatePopoverProps) {
  const [open, setOpen] = useState(false)
  const selected = DateTime.fromISO(value).toJSDate()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label={label}
            className={className ?? 'w-full justify-start gap-2 font-normal'}
          />
        }>
        <CalendarDays />
        {DateTime.fromISO(value).setLocale('ru').toFormat('dd.MM.yyyy')}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={ru}
          selected={selected}
          defaultMonth={selected}
          onSelect={date => {
            if (!date) return
            onChange(DateTime.fromJSDate(date).toFormat('yyyy-MM-dd'))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
