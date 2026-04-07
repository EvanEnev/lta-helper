import {memo, useCallback, useState} from 'react'
import {LTWorker} from '@/src/utils/types'
import {NumberField} from '@heroui/react-beta'

interface PayrollCreateValueCellProps {
  data: number
  workerId: LTWorker['id']
  type?: 'location' | 'bonuses' | 'fines' | 'value' | 'external_payment'
  callback: (
    workerId: LTWorker['id'],
    value: number,
    type: 'location' | 'bonuses' | 'fines' | 'value' | 'external_payment',
  ) => void
}

export default memo(function PayrollCreateValueCell({
  data,
  workerId,
  callback,
  type = 'value',
}: PayrollCreateValueCellProps) {
  const [value, setValue] = useState<number>(data)

  const onValueChange = useCallback(
    (value: number) => {
      setValue(value)
      callback(workerId, value, type)
    },
    [callback, type, workerId],
  )

  return (
    <NumberField
      className="h-full w-full"
      defaultValue={value || undefined}
      aria-label={type}
      onChange={onValueChange}>
      <NumberField.Group className="flex h-full">
        <NumberField.Input placeholder="0" className="h-full w-full flex-1" />
      </NumberField.Group>
    </NumberField>
  )
})
