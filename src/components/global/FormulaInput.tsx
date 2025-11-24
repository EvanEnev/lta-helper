import {Input} from '@heroui/react'
import {useCallback, useEffect, useState} from 'react'
import {evaluate} from 'mathjs'

interface FormulaInputProps {
  label?: string
  ariaLabel?: string
  isReadOnly?: boolean
  labelPlacement?: 'outside' | 'outside-left' | 'outside-top' | 'inside'
  callback: ({
    text,
    value,
    error,
  }: {
    text: string
    value: number
    error?: boolean
  }) => void
  value?: string
  className?: string
  description?: string
}

export default function FormulaInput({
  label,
  ariaLabel,
  labelPlacement = 'inside',
  callback,
  isReadOnly = false,
  value: initialValue = '',
  className = '',
  description = '',
}: FormulaInputProps) {
  const [hasError, setHasError] = useState<boolean>(false)
  const [value, setValue] = useState<string>(initialValue)

  const onChange = useCallback(
    (value: string) => {
      let newValue = null
      setValue(value || '')
      try {
        newValue = evaluate(value)
      } catch {}

      const isError = newValue === null || typeof newValue !== 'number'
      setHasError(isError)

      callback({
        text: value,
        value: newValue,
        error: isError,
      })
    },
    [callback],
  )

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <Input
      isReadOnly={isReadOnly}
      labelPlacement={labelPlacement}
      color={hasError ? 'danger' : 'default'}
      className={className}
      label={label}
      aria-label={ariaLabel}
      value={value}
      onValueChange={onChange}
      description={description}
    />
  )
}
