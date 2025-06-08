'use client'

import {ToastProvider} from '@heroui/react'
import useIsMobile from '@/src/hooks/useIsMobile'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {useEffect, useMemo, useState} from 'react'

export default function CToastProvider() {
  const isMobile = useIsMobile()
  const [offset, setOffset] = useState(0)
  const {headerRef} = useAuth()

  useEffect(() => {
    if (headerRef.current?.offsetHeight) {
      setOffset(headerRef.current.offsetHeight)
    }
  }, [headerRef])

  return (
    <ToastProvider
      placement={isMobile ? 'top-center' : 'bottom-right'}
      toastOffset={offset}
    />
  )
}
