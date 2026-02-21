import {SummaryColumn} from '@/src/components/salary/summarized/SummarizedPage'
import {LTSalarySummary} from '@/src/utils/types'

interface SummarizedRowProps {
  data: LTSalarySummary
  columns: SummaryColumn[]
}

export default function SummarizedRow({data, columns}: SummarizedRowProps) {
  return (
    <div className="bg-content1 flex gap-2 rounded-2xl p-2">
      {columns.map(col => {
        const element = col.accessorFn(data.workerId)
        return (
          <div
            className="bg-content2 flex flex-1 items-center rounded-xl p-2"
            key={col.title}>
            {typeof element === 'string' ? <p>{element}</p> : element}
          </div>
        )
      })}
    </div>
  )
}
