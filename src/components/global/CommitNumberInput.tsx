'use client'

import {useState} from 'react'
import {Input} from '@/components/ui/input'
import {cn} from '@/lib/utils'

interface CommitNumberInputProps {
  value: number | null | undefined
  onCommit: (value: number) => void
  label: string
  allowNegative?: boolean
  readOnly?: boolean
  className?: string
}

export default function CommitNumberInput({
  value,
  onCommit,
  label,
  allowNegative,
  readOnly,
  className,
}: CommitNumberInputProps) {
  const current = Number(value) || 0
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    const parsed = parseFloat((draft ?? '').replace(',', '.'))
    setDraft(null)

    if (!Number.isNaN(parsed) && parsed !== current) onCommit(parsed)
    else if (draft !== null && draft.trim() === '' && current !== 0) onCommit(0)
  }

  const pattern = allowNegative ? /^-?\d*[.,]?\d*$/ : /^\d*[.,]?\d*$/

  return (
    <Input
      inputMode="decimal"
      aria-label={label}
      readOnly={readOnly}
      className={cn('h-8 tabular-nums', className)}
      value={draft ?? (current === 0 ? '' : String(current))}
      placeholder="0"
      onFocus={event => event.currentTarget.select()}
      onChange={event => {
        if (pattern.test(event.target.value)) setDraft(event.target.value)
      }}
      onBlur={commit}
      onKeyDown={event => event.key === 'Enter' && event.currentTarget.blur()}
    />
  )
}
