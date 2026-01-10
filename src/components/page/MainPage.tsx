'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import MobilePage from '@/src/components/page/MobilePage'
import DesktopPage from '@/src/components/page/DesktopPage'
import {ShortSalary} from '@/app/page'
import {Day, LTWorker} from '@/src/utils/types'

interface MainPageProps {
  salaryData: ShortSalary
  worker: LTWorker
  workingDays: Day[]
}

export default function MainPage({
  salaryData,
  worker,
  workingDays,
}: MainPageProps) {
  const isMobile = useIsMobile()

  return isMobile ? (
    <MobilePage
      worker={worker}
      workingDays={workingDays}
      salaryData={salaryData}
    />
  ) : (
    <DesktopPage
      worker={worker}
      workingDays={workingDays}
      salaryData={salaryData}
    />
  )
}
