import {SalaryData} from '@/src/utils/types'
import {Textarea} from '@heroui/react'
import {useCallback} from 'react'

export default function CellBodyEditable({
  data,
  handleEdit,
}: {
  data: SalaryData
  handleEdit: (data: SalaryData) => void
}) {
  const update = useCallback(
    (value: string) => {
      handleEdit({...data, comment: value})
    },
    [data, handleEdit],
  )

  return (
    <Textarea
      aria-label="Комментарий"
      classNames={{
        innerWrapper: 'min-h-[4.5rem] items-center justify-center',
        input: 'text-center h-full',
      }}
      style={{height: 'fit-content'}}
      className="col-span-2"
      value={data.comment || ''}
      onValueChange={update}
    />
  )
}
