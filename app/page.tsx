'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import DesktopPage from '@/src/components/page/DesktopPage'
import MobilePage from '@/src/components/page/MobilePage'

export default function Home() {
  const isMobile = useIsMobile()

  return isMobile ? <MobilePage /> : <DesktopPage />
}
