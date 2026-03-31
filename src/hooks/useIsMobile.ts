'use client'

import {useLayoutEffect, useState} from 'react'

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(/mobile/i.test(navigator.userAgent))

  useLayoutEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')

    const listener = () => {
      setIsMobile(media.matches)
    }

    listener()
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [])

  return isMobile
}
