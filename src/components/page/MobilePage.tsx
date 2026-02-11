import UpcomingShifts from './UpcomingShifts'
import RankIcon from '@/src/components/global/RankIcon'
import {ShortSalary} from '@/app/page'
import UpcomingSalary from '@/src/components/page/UpcomingSalary'
import {Day, LTWorker} from '@/src/utils/types'

interface MobilePageProps {
  worker: LTWorker
  salaryData: ShortSalary
  workingDays: Day[]
}

export default function DesktopPage({
  salaryData,
  worker,
  workingDays,
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
      <div className="flex max-w-[90dvw] flex-col items-center gap-4">
        <UpcomingShifts workingDays={workingDays} />
        <UpcomingSalary data={salaryData} />
      </div>
    </main>
  )
}
