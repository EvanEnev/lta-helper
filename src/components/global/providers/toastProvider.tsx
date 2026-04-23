'use client'

import {Toast} from '@heroui/react'

export default function CToastProvider() {
  return <Toast.Provider className="z-10000" placement="top" />
}
