'use client'

import workerState from '@/src/state/workerState'
import {useRecoilValue} from 'recoil'
import useIsMobile from '@/src/hooks/useIsMobile'
import MobileSchedule from '@/src/components/schedule/MobileSchedule'
import DesktopSchedule from '@/src/components/schedule/DesktopSchedule'

export default function Schedule() {
  const isMobile = useIsMobile()
  const worker = useRecoilValue(workerState)

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 gap-4">
      <h1 className="text-5xl font-bold">График работы</h1>
      <p className="text-3xl">Позывной: {worker.name}</p>
      {isMobile ? <MobileSchedule /> : <DesktopSchedule />}
    </main>
  )
}
