import {LTPayrollData} from '@/src/utils/types'
import {PayrollColumn} from '@/src/components/payrolls/create/PayrollCreatePage'

interface PayrollCreateRowProps {
  data: LTPayrollData
  columns: PayrollColumn[]
}

export default function PayrollCreateRow({
  data,
  columns,
}: PayrollCreateRowProps) {
  return (
    <div className="bg-surface flex gap-2 rounded-2xl p-2">
      {columns.map(col => {
        const element = col.accessorFn(data.workerId)
        return (
          <div
            className="bg-default flex flex-1 items-center justify-center rounded-xl p-2"
            key={col.title}>
            {typeof element === 'string' ? <p>{element}</p> : element}
          </div>
        )
      })}
    </div>
  )
}
