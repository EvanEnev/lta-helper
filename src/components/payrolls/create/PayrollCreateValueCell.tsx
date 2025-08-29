import {NumberInput} from '@heroui/react'
import {useCallback, useState} from 'react'

interface PayrollCreateValueCellProps {
  data: number
  callback: (value: number) => void
}

export default function PayrollCreateValueCell({
  data,
  callback,
}: PayrollCreateValueCellProps) {
  const [value, setValue] = useState<number>(data)

  const onValueChange = useCallback((value: number) => {
    setValue(value)
    callback(value)
  }, [])

  return (
    <NumberInput
      value={value}
      minValue={0}
      isWheelDisabled
      onValueChange={onValueChange}
    />
  )
}
