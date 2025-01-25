'use client'

import workerState from '@/src/state/workerState'
import {useRecoilValue} from 'recoil'
import useIsMobile from '@/src/hooks/useIsMobile'
import MobileSchedule from '@/src/components/schedule/MobileSchedule'
import DesktopSchedule from '@/src/components/schedule/DesktopSchedule'
import {Calendar, User} from 'solar-icon-set'

export default function Schedule() {
  const isMobile = useIsMobile()
  const worker = useRecoilValue(workerState)

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 gap-4">
      <div className="flex gap-4 justify-center">
        <Calendar color={'#ffffff'} size={48} />
        <span className="text-5xl font-bold w-fit word-wrap inline-block">
          График работы
        </span>
      </div>
      <div className="text-3xl flex gap-2">
        <User size={36} />
        {worker.name}
      </div>
      {isMobile ? <MobileSchedule /> : <DesktopSchedule />}
    </main>
  )
}
