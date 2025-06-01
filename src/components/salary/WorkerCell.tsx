import {SalaryUser} from '@/src/utils/types'
import RankIcon from '@/src/components/global/RankIcon'

export default function WorkerCell({data}: {data: SalaryUser}) {
  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <RankIcon className="max-h-10" rank={data.rank || ''} />
      <div className="flex flex-col gap-2">
        <p>{data.name}</p>
        <p>{data.firstName}</p>
        <p>{data.rank}</p>
        {data.isFormer && <i>Бывший</i>}
      </div>
    </div>
  )
}
