'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import MobileSchedule from '@/src/components/schedule/MobileSchedule'
import DesktopSchedule from '@/src/components/schedule/DesktopSchedule'
import {LTLocation} from '@/src/utils/types'

interface SchedulePageProps {
  locations: LTLocation[]
}

export default function SchedulePage({locations}: SchedulePageProps) {
  const isMobile = useIsMobile()

  return (
    <main className="flex flex-col items-center justify-start gap-4 p-4">
      {isMobile ? (
        <MobileSchedule locations={locations} />
      ) : (
        <DesktopSchedule />
      )}
    </main>
  )
}
