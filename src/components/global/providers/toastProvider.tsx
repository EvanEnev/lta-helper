'use client'

import {ToastProvider} from '@heroui/react'
import useIsMobile from '@/src/hooks/useIsMobile'
import {useAtomValue} from 'jotai'
import {toastOffsetAtom} from '@/src/utils/global/atoms'

export default function CToastProvider() {
  const isMobile = useIsMobile()
  const toastOffset = useAtomValue(toastOffsetAtom)

  return (
    <ToastProvider
      regionProps={{classNames: {}}}
      placement={isMobile ? 'top-center' : 'bottom-right'}
      toastOffset={isMobile ? toastOffset : 0}
    />
  )
}
