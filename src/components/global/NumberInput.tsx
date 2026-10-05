'use client'

import {useState} from 'react'
import {Minus, Plus} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {cn} from '@/lib/utils'

interface NumberInputProps {
  value?: number | null
  onChange: (value: number | undefined) => void
  placeholder?: string
  label: string
  className?: string
}

// Пока поле в фокусе, показываем то, что вводит пользователь, а не
// пересчитанное значение: иначе стереть число до пустоты было бы нельзя
export function NumberInput({
  value,
  onChange,
  placeholder = '0',
  label,
  className,
}: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <Input
      inputMode="decimal"
      aria-label={label}
      placeholder={placeholder}
      className={cn('tabular-nums', className)}
      value={draft ?? (value ?? '').toString()}
      onFocus={event => event.currentTarget.select()}
      onChange={event => {
        const text = event.target.value.replace(',', '.')
        if (!/^\d*\.?\d*$/.test(text)) return

        setDraft(text)

        const parsed = parseFloat(text)
        onChange(Number.isNaN(parsed) ? undefined : parsed)
      }}
      onBlur={() => setDraft(null)}
    />
  )
}

interface CounterProps {
  value: number
  onChange: (value: number) => void
  label: string
}

export function Counter({value, onChange, label}: CounterProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={`${label}: меньше`}
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}>
        <Minus />
      </Button>
      <span
        aria-label={label}
        className="w-8 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={`${label}: больше`}
        onClick={() => onChange(value + 1)}>
        <Plus />
      </Button>
    </div>
  )
}
