import getRankIcon from '@/src/utils/page/getRankIcon'
import UpcomingShifts from './UpcomingShifts'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function DesktopPage() {
  const {worker} = useAuth()

  return (
    <main className="h-screen w-screen">
      <div className="flex justify-between gap-4 p-4">
        <div className="flex h-fit items-center gap-4 text-3xl">
          {getRankIcon(worker?.rank || '')} {worker?.rank || ''}
        </div>
        <UpcomingShifts />
      </div>
    </main>
  )
}
