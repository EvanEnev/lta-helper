'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import {useSession} from 'next-auth/react'
import {usePathname} from 'next/navigation'
import MobileHeader from './MobileHeader'
import DesktopHeader from './DesktopHeader'

export default function Header() {
  const {data: session} = useSession()
  const isMobile = useIsMobile()
  const path = usePathname()

  if (path === '/login') return ''
  if (path === '/register') return ''

  return isMobile ? (
    <MobileHeader session={session} />
  ) : (
    <DesktopHeader session={session} />
  )
}
