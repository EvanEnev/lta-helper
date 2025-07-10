'use client'

import {useMediaQuery} from 'react-responsive'

export default function useIsMobile() {
  const isPC = useMediaQuery({query: '(width >= 40rem)'})

  return !isPC
}
