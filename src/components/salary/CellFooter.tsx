import {SalaryData} from '@/src/utils/types'
import {TextArea} from '@heroui/react'

export default function CellFooter({data}: {data: SalaryData}) {
  return (
    <TextArea
      variant="secondary"
      aria-label="Комментарий"
      className="col-span-2 w-full"
      value={data.comment || ''}
      readOnly
    />
  )
}
