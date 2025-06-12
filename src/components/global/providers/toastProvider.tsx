'use client'

import {ToastProvider} from '@heroui/react'
import useIsMobile from '@/src/hooks/useIsMobile'
import {useAuth} from '@/src/components/global/providers/authProvider'

export default function CToastProvider() {
  const isMobile = useIsMobile()
  const {toastOffset} = useAuth()

  return (
    <ToastProvider
      regionProps={{classNames: {}}}
      placement={isMobile ? 'top-center' : 'bottom-right'}
      toastOffset={isMobile ? toastOffset : 0}
    />
  )
}
