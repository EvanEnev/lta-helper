import type {ShortSalary} from '@/app/page'
import RankDataCard from '@/src/components/page/RankDataCard'
import RankHero from '@/src/components/page/RankHero'
import ShiftStats from '@/src/components/page/ShiftStats'
import UpcomingSalary from '@/src/components/page/UpcomingSalary'
import UpcomingShifts from '@/src/components/page/UpcomingShifts'
import {getShifts} from '@/src/components/page/shifts'
import {cn} from '@/lib/utils'
import type {Day, LTWorker, RankDescription} from '@/src/utils/types'

interface MainPageProps {
  salaryData: ShortSalary
  worker: LTWorker
  workingDays: Day[]
  ranksData: RankDescription[]
}

export default function MainPage({
  salaryData,
  worker,
  workingDays,
  ranksData,
}: MainPageProps) {
  const currentRank = ranksData.find(d => d.rank.name === worker.rank)
  const {upcoming, worked, left} = getShifts(workingDays)

  return (
    <main className="mx-auto flex w-full max-w-400 flex-col gap-4 p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-start">
      <div className="contents lg:flex lg:flex-col lg:gap-4">
        <RankHero rank={worker.rank || ''} data={currentRank?.data ?? []} />
        <ShiftStats
          worked={worked}
          left={left}
          nextIn={upcoming[0]?.daysLeft}
        />
        <section className="order-last grid gap-4 sm:grid-cols-2 lg:order-0 lg:items-start xl:grid-cols-3">
          {ranksData.map(rank => (
            <RankDataCard
              key={rank.rank.id}
              workerRank={worker.rank}
              rank={rank}
              className={cn(rank.rank.name !== worker.rank && 'hidden sm:flex')}
            />
          ))}
        </section>
      </div>
      <div className="contents lg:flex lg:flex-col lg:gap-4">
        <UpcomingShifts shifts={upcoming} />
        <UpcomingSalary data={salaryData} />
      </div>
    </main>
  )
}
