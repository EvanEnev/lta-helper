import RankIcon from '@/src/components/global/RankIcon'
import {LTRank, LTWorker} from '@/src/utils/types'

interface PayrollCreateWorkerCellProps {
  name: LTWorker['name']
  rank: LTRank['name']
}

export default function PayrollCreateWorkerCell({
  name,
  rank,
}: PayrollCreateWorkerCellProps) {
  return (
    <div className="flex min-w-32 flex-1 items-center justify-start gap-2">
      <RankIcon rank={rank} />
      <p className="mx-auto">{name}</p>
    </div>
  )
}
