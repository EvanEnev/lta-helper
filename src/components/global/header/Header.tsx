'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import {useSession} from 'next-auth/react'
import {usePathname} from 'next/navigation'
import MobileHeader from './MobileHeader'
import DesktopHeader from './DesktopHeader'

export default function Header() {
  const {data: session} = useSession()
  const isMobile = useIsMobile()

  return isMobile ? (
    <MobileHeader session={session} />
  ) : (
    <DesktopHeader session={session} />
  )
}
