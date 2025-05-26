import getRankIcon from '@/src/utils/page/getRankIcon'
import UpcomingShifts from './UpcomingShifts'
import useTelegramLogin from '@/src/hooks/useTelegramLogin'
import {useEffect} from 'react'

export default function DesktopPage() {
  const {user} = useTelegramLogin()

  useEffect(() => {
    console.log(user)
  }, [user])

  return (
    <main className="h-screen w-screen">
      <div className="flex justify-between gap-4 p-4">
        <div className="flex h-fit items-center gap-4 text-3xl">
          // @ts-ignore
          {getRankIcon(user?.rank || '')} {user?.rank || ''}
        </div>
        <UpcomingShifts />
      </div>
    </main>
  )
}
