'use client'

import {useState} from 'react'
import {CalendarDays} from 'lucide-react'
import {DateTime} from 'luxon'
import {ru} from 'react-day-picker/locale'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'

interface ExpiryPickerProps {
  value: string | null // yyyy-MM-dd
  min: string // yyyy-MM-dd, раньше выбрать нельзя
  onChange: (value: string | null) => void
}

// Даты у Calendar - локальные Date, наружу отдаём строку yyyy-MM-dd
const toDate = (key: string) => DateTime.fromISO(key).toJSDate()

export default function ExpiryPicker({
  value,
  min,
  onChange,
}: ExpiryPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? toDate(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label="Срок действия"
            className="w-40 justify-start gap-2 font-normal"
          />
        }>
        <CalendarDays />
        {value ? (
          DateTime.fromISO(value).setLocale('ru').toFormat('dd.MM.yyyy')
        ) : (
          <span className="text-muted-foreground">Выбрать дату</span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={ru}
          selected={selected}
          defaultMonth={selected ?? toDate(min)}
          disabled={{before: toDate(min)}}
          onSelect={date => {
            onChange(date ? DateTime.fromJSDate(date).toISODate() : null)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
