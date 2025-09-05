import {NumberInput} from '@heroui/react'
import {memo, useCallback, useEffect, useState} from 'react'
import {LTWorker} from '@/src/utils/types'

interface PayrollCreateValueCellProps {
  data: number
  workerId: LTWorker['id']
  type?: 'location' | 'bonuses' | 'fines' | 'value'
  callback: (
    workerId: LTWorker['id'],
    value: number,
    type: 'location' | 'bonuses' | 'fines' | 'value',
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
      className="w-full flex-1"
      value={value}
      minValue={0}
      isWheelDisabled
      onValueChange={onValueChange}
    />
  )
})
