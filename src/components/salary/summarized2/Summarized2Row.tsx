import {SummaryColumn} from '@/src/components/salary/summarized/SummarizedPage'
import {LTSalarySummary} from '@/src/utils/types'

interface SummarizedRowProps {
  data: LTSalarySummary
  columns: SummaryColumn[]
}

export default function Summarized2Row({data, columns}: SummarizedRowProps) {
  return (
    <div className="bg-surface flex gap-2 rounded-2xl p-2">
      {columns.map(col => {
        const element = col.accessorFn(data.workerId)
        return (
          <div
            className="bg-default flex flex-1 items-center rounded-xl p-2"
            key={col.title}>
            {typeof element === 'string' ? <p>{element}</p> : element}
          </div>
        )
      })}
    </div>
  )
}
