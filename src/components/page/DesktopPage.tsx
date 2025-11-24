import UpcomingShifts from './UpcomingShifts'
import {useAuth} from '@/src/components/global/providers/authProvider'
import RankIcon from '@/src/components/global/RankIcon'
import UpcomingSalary from '@/src/components/page/UpcomingSalary'
import {ShortSalary} from '@/app/page'
import {Skeleton} from '@heroui/react'

export default function DesktopPage({salaryData}: {salaryData: ShortSalary}) {
  const {worker} = useAuth()

  return (
    <main className="h-full w-full">
      <div className="flex justify-between gap-4 p-4">
        <Skeleton isLoaded={!!worker.rank} className="rounded-2xl">
          <div className="flex h-fit items-center gap-4 text-3xl">
            <RankIcon
              style={{filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))'}}
              rank={worker?.rank || ''}
              className="w-[14rem]"
            />{' '}
            {worker?.rank || ''}
          </div>
        </Skeleton>
        <div className="flex w-[50%] max-w-full flex-col items-center gap-4">
          <UpcomingShifts />
          <UpcomingSalary data={salaryData} />
        </div>
      </div>
    </main>
  )
}
