'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import MobilePage from '@/src/components/page/MobilePage'
import DesktopPage from '@/src/components/page/DesktopPage'
import {ShortSalary} from '@/app/page'

export default function MainPage({salaryData}: {salaryData: ShortSalary}) {
  const isMobile = useIsMobile()

  return isMobile ? (
    <MobilePage salaryData={salaryData} />
  ) : (
    <DesktopPage salaryData={salaryData} />
  )
}
