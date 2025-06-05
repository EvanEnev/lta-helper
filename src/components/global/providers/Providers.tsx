'use client'
import {HeroUIProvider} from '@heroui/react'
import Header from '@/src/components/global/header/Header'
import AuthProvider from '@/src/components/global/providers/authProvider'
import AlertProvider from '@/src/components/global/providers/alertProvider'
import {Provider} from 'jotai'

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <AuthProvider>
      <HeroUIProvider locale="ru-RU" className="min-h-[100dvh] min-w-[100dvw]">
        <Header />
        <Provider>
          <AlertProvider />
          {children}
        </Provider>
      </HeroUIProvider>
    </AuthProvider>
  )
}
