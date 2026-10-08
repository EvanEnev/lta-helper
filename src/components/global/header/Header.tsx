'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import {usePathname} from 'next/navigation'
import MobileHeader from './MobileHeader'
import {useEffect, useLayoutEffect, useRef} from 'react'
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

  if (path === '/login') return ''
  if (path === '/register') return ''

  return (
    <>
      <MobileHeader ref={ref} worker={worker} className="block sm:hidden" />
    </>
  )
}
