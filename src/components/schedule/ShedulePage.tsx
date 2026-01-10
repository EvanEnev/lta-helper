'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import MobileSchedule from '@/src/components/schedule/MobileSchedule'
import DesktopSchedule from '@/src/components/schedule/DesktopSchedule'
import {Day, LTLocation, LTWorker} from '@/src/utils/types'
import {DateTime} from "luxon";

interface SchedulePageProps {
  locations: LTLocation[]
    worker: LTWorker
    workingDays: Day[]
}

export default function SchedulePage({locations, worker, workingDays: initialDays}: SchedulePageProps) {
  const isMobile = useIsMobile()

    // @ts-ignore
    const workingDays = initialDays.map(d => ({...d, date: DateTime.fromISO(d.date)}))

  return (
    <main className="flex flex-col items-center justify-start gap-4 p-4">
      {isMobile ? (
        <MobileSchedule worker={worker} locations={locations} workingDays={workingDays} />
      ) : (
        <DesktopSchedule worker={worker} workingDays={workingDays} />
      )}
    </main>
  )
}
