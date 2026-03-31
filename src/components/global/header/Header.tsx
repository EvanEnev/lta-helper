'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import {usePathname} from 'next/navigation'
import MobileHeader from './MobileHeader'
import DesktopHeader from './DesktopHeader'
import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {LTWorker} from '@/src/utils/types'
import {useSession} from '@/lib/auth/authClient'
import {useSetAtom} from 'jotai'
import {headerSizesAtom, toastOffsetAtom} from '@/src/utils/global/atoms'

export default function Header() {
  const ref = useRef<HTMLElement | null>(null)
  const setHeaderSizes = useSetAtom(headerSizesAtom)
  const worker = useSession().data?.user as LTWorker | undefined
  const setToastOffset = useSetAtom(toastOffsetAtom)
  const isMobile = useIsMobile()
  const path = usePathname()

  const [scrolled, setScrolled] = useState(false)

  useLayoutEffect(() => {
    if (!ref.current) return

    const update = () => {
      const rect = ref.current!.getBoundingClientRect()
      setHeaderSizes({width: isMobile ? 0 : rect.width, height: 0})
    }

    update()

    const ro = new ResizeObserver(update)
    ro.observe(ref.current)

    return () => ro.disconnect()
  }, [isMobile, setHeaderSizes])

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (ref.current) {
        const height = ref.current.offsetHeight
        document.documentElement.style.setProperty(
          '--header-height',
          `${height}px`,
        )
        setToastOffset(height)
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)

    const observer = new ResizeObserver(updateHeaderHeight)
    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      setScrolled(prev => {
        if (prev !== isScrolled) return isScrolled
        return prev
      })
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

  return (
    <>
      <MobileHeader ref={ref} worker={worker} className="block sm:hidden" />
      <DesktopHeader ref={ref} worker={worker} className="hidden sm:block" />
    </>
  )
}
