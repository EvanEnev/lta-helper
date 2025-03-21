'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import MobileSchedule from '@/src/components/schedule/MobileSchedule'
import DesktopSchedule from '@/src/components/schedule/DesktopSchedule'
import {Calendar, User} from 'solar-icon-set'
import {useSession} from 'next-auth/react'
import {Avatar} from '@heroui/react'

export default function Schedule() {
  const isMobile = useIsMobile()

  return (
    <main className="flex flex-col items-center justify-start p-4 gap-4">
      {isMobile ? <MobileSchedule /> : <DesktopSchedule />}
    </main>
  )
}
