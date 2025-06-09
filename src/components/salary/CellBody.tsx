import {SalaryData} from '@/src/utils/types'
import {Textarea} from '@heroui/react'

export default function CellBodyEditable({data}: {data: SalaryData}) {
  return (
    <Textarea
      aria-label="Комментарий"
      classNames={{input: 'max-h-[4.5rem] min-h-[4.5rem]'}}
      className="col-span-2"
      value={data.comment || ''}
      isReadOnly
    />
  )
}
