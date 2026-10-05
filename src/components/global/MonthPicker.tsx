'use client'

import {DateTime} from 'luxon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import capitalize from '@/lib/functions/capitalize'

interface MonthPickerProps {
  dates: string[] // ISO первых чисел месяцев
  value: string // yyyy-MM-dd
  onChange: (value: string) => void
  className?: string
}

const label = (date: DateTime) =>
  capitalize(date.setLocale('ru').toFormat('LLLL yyyy'))

export default function MonthPicker({
  dates,
  value,
  onChange,
  className,
}: MonthPickerProps) {
  const items = dates.map(iso => {
    const date = DateTime.fromISO(iso)

    return {value: date.toFormat('yyyy-MM-dd'), label: label(date)}
  })

  return (
    <Select
      value={value}
      items={items}
      onValueChange={next => next && onChange(next)}>
      <SelectTrigger className={className} aria-label="Месяц">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map(item => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
