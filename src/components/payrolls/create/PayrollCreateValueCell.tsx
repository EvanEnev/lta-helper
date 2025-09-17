import {NumberInput} from '@heroui/react'
import {memo, useCallback, useState} from 'react'
import {LTWorker} from '@/src/utils/types'

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
    <NumberInput
      className="w-full min-w-[8rem] flex-1"
      value={value}
      minValue={0}
      isWheelDisabled
      onValueChange={onValueChange}
    />
  )
})
