'use client'

import {useCallback, useId, useState} from 'react'
import {evaluate} from 'mathjs'
import {Input} from '@/components/ui/input'

interface FormulaFieldProps {
  label: string
  value?: string
  readOnly?: boolean
  className?: string
  callback?: (result: {text: string; value: number; error: boolean}) => void
  onCommit?: (text: string) => void
}

export const safeEvaluate = (text: string): number | null => {
  if (!text.trim()) return null

  try {
    const result = evaluate(text)

    return typeof result === 'number' && Number.isFinite(result) ? result : null
  } catch {
    return null
  }
}

export default function FormulaField({
  label,
  value: initialValue = '',
  readOnly = false,
  className,
  callback,
  onCommit,
}: FormulaFieldProps) {
  const id = useId()
  const [text, setText] = useState(initialValue)
  const [hasError, setHasError] = useState(false)

  const [syncedValue, setSyncedValue] = useState(initialValue)
  if (syncedValue !== initialValue) {
    setSyncedValue(initialValue)
    setText(initialValue)
  }

  const onChange = useCallback(
    (next: string) => {
      setText(next)

      const result = next.trim() ? safeEvaluate(next) : 0
      const error = result === null

      setHasError(error)
      callback?.({text: next, value: result ?? 0, error})
    },
    [callback],
  )

  const result = safeEvaluate(text)

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        value={text}
        readOnly={readOnly}
        aria-invalid={hasError}
        autoComplete="off"
        className="mt-1.5"
        onChange={event => onChange(event.target.value)}
        onBlur={() => {
          if (!hasError && text !== initialValue) onCommit?.(text)
        }}
      />
      <p className="text-muted-foreground mt-1 h-4 text-xs tabular-nums">
        {hasError ? 'Не удалось посчитать' : text.trim() ? `= ${result}` : ''}
      </p>
    </div>
  )
}
