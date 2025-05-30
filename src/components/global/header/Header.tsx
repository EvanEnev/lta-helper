'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import {usePathname} from 'next/navigation'
import MobileHeader from './MobileHeader'
import DesktopHeader from './DesktopHeader'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function Header() {
  const {worker} = useAuth()
  const isMobile = useIsMobile()
  const path = usePathname()

  if (path === '/login') return ''
  if (path === '/register') return ''

  return isMobile ? (
    <MobileHeader worker={worker} />
  ) : (
    <DesktopHeader worker={worker} />
  )
}
