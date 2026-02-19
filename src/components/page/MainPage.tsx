'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import MobilePage from '@/src/components/page/MobilePage'
import DesktopPage from '@/src/components/page/DesktopPage'
import {ShortSalary} from '@/app/page'
import {Day, LTWorker, RankDescription} from '@/src/utils/types'

interface MainPageProps {
  salaryData: ShortSalary
  worker: LTWorker
  workingDays: Day[]
  ranksData: RankDescription[]
}

export default function MainPage({
  salaryData,
  worker,
  workingDays,
  ranksData,
}: MainPageProps) {
  const isMobile = useIsMobile()

  return isMobile ? (
    <MobilePage
      ranksData={ranksData}
      worker={worker}
      workingDays={workingDays}
      salaryData={salaryData}
    />
  ) : (
    <DesktopPage
      ranksData={ranksData}
      worker={worker}
      workingDays={workingDays}
      salaryData={salaryData}
    />
  )
}
