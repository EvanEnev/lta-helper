import RankIcon from '@/src/components/global/RankIcon'

interface PayrollCreateWorkerCellProps {
  data: {name: string; rank: string}
}

export default function PayrollCreateWorkerCell({
  data,
}: PayrollCreateWorkerCellProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <RankIcon rank={data.rank} />
      <p>{data.name}</p>
    </div>
  )
}
