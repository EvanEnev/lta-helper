import UpcomingShifts from './UpcomingShifts'
import {useAuth} from '@/src/components/global/providers/authProvider'
import RankIcon from '@/src/components/global/RankIcon'
import {ShortSalary} from '@/app/page'
import UpcomingSalary from '@/src/components/page/UpcomingSalary'

export default function DesktopPage({salaryData}: {salaryData: ShortSalary}) {
  const {worker} = useAuth()

  return (
    <main className="flex w-full flex-col items-center gap-4 p-4">
      <div className="flex h-fit flex-col items-center gap-4 text-3xl">
        <RankIcon rank={worker.rank || ''} className="w-full" />
        {worker.rank}
      </div>
      <div className="flex flex-col items-center gap-4">
        <UpcomingShifts />
        <UpcomingSalary data={salaryData} />
      </div>
    </main>
  )
}
