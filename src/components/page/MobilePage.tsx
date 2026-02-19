import UpcomingShifts from './UpcomingShifts'
import RankIcon from '@/src/components/global/RankIcon'
import {ShortSalary} from '@/app/page'
import UpcomingSalary from '@/src/components/page/UpcomingSalary'
import {Day, LTWorker, RankDescription} from '@/src/utils/types'
import Carousel from '@/src/components/global/Carousel'
import RankDataCard from '@/src/components/page/RankDataCard'

interface MobilePageProps {
  worker: LTWorker
  salaryData: ShortSalary
  workingDays: Day[]
  ranksData: RankDescription[]
}

export default function DesktopPage({
  salaryData,
  worker,
  workingDays,
  ranksData,
}: MobilePageProps) {
  return (
    <main className="flex w-full flex-col items-center gap-4 p-4">
      <div className="flex h-fit flex-col items-center gap-4 text-3xl">
        <RankIcon
          style={{
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))',
          }}
          rank={worker.rank || ''}
          className="w-full"
        />
        {worker.rank}
      </div>
      <Carousel>
        {ranksData.map(rank => (
          <RankDataCard
            key={rank.rank.id}
            workerRank={worker.rank}
            rank={rank}
          />
        ))}
      </Carousel>
      <div className="flex max-w-[90dvw] flex-col items-center gap-4">
        <UpcomingShifts workingDays={workingDays} />
        <UpcomingSalary data={salaryData} worker={worker} />
      </div>
    </main>
  )
}
