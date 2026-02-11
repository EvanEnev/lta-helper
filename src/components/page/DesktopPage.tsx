import UpcomingShifts from './UpcomingShifts'
import RankIcon from '@/src/components/global/RankIcon'
import UpcomingSalary from '@/src/components/page/UpcomingSalary'
import {ShortSalary} from '@/app/page'
import {Skeleton} from '@heroui/react'
import {Day, LTWorker} from '@/src/utils/types'

interface DesktopPageProps {
  worker: LTWorker
  workingDays: Day[]
  salaryData: ShortSalary
}

export default function DesktopPage({
  salaryData,
  worker,
  workingDays,
}: DesktopPageProps) {
  return (
    <main className="h-full w-full">
      <div className="flex justify-between gap-4 p-4">
        <Skeleton isLoaded={!!worker.rank} className="rounded-2xl">
          <div className="flex h-fit items-center gap-4 text-3xl">
            <RankIcon
              style={{filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))'}}
              rank={worker?.rank || ''}
              className="w-56"
            />{' '}
            {worker?.rank || ''}
          </div>
        </Skeleton>
        <div className="flex w-[50%] max-w-full flex-col items-center gap-4">
          <UpcomingShifts workingDays={workingDays} />
          <UpcomingSalary data={salaryData} />
        </div>
      </div>
    </main>
  )
}
