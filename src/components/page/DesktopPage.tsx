import UpcomingShifts from './UpcomingShifts'
import {useAuth} from '@/src/components/global/providers/authProvider'
import RankIcon from '@/src/components/global/RankIcon'

export default function DesktopPage() {
  const {worker} = useAuth()

  return (
    <main className="h-screen w-screen">
      <div className="flex justify-between gap-4 p-4">
        <div className="flex h-fit items-center gap-4 text-3xl">
          <RankIcon rank={worker?.rank || ''} className="w-[14rem]" />{' '}
          {worker?.rank || ''}
        </div>
        <UpcomingShifts />
      </div>
    </main>
  )
}
