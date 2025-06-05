'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import {usePathname} from 'next/navigation'
import MobileHeader from './MobileHeader'
import DesktopHeader from './DesktopHeader'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {useEffect, useState} from 'react'

export default function Header() {
  const {worker} = useAuth()
  const isMobile = useIsMobile()
  const path = usePathname()

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchmove', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
    }
  }, [])

  if (path === '/login') return ''
  if (path === '/register') return ''

  return isMobile ? (
    <MobileHeader worker={worker} scrolled={scrolled} />
  ) : (
    <DesktopHeader worker={worker} scrolled={scrolled} />
  )
}
