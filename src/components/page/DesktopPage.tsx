import getRankIcon from '@/src/utils/page/getRankIcon'
import {useSession} from 'next-auth/react'
import UpcomingShifts from './UpcomingShifts'

export default function DesktopPage() {
  const {data: session} = useSession()

  return (
    <main className="w-screen">
      <div className="flex justify-between gap-4 p-4">
        <div className="text-3xl flex items-center gap-4 h-fit">
          {getRankIcon(session?.user.rank)} {session?.user.rank}
        </div>
        <UpcomingShifts />
      </div>
    </main>
  )
}
