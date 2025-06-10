'use client'
import {HeroUIProvider} from '@heroui/react'
import ToastProvider from '@/src/components/global/providers/toastProvider'
import Header from '@/src/components/global/header/Header'
import AuthProvider from '@/src/components/global/providers/authProvider'
import {Provider} from 'jotai'

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <AuthProvider>
      <HeroUIProvider locale="ru-RU" className="min-h-[100dvh] min-w-[100dvw]">
        <Header />
        <Provider>
          <ToastProvider />
          {children}
        </Provider>
      </HeroUIProvider>
    </AuthProvider>
  )
}
