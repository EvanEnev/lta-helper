'use client'
import {HeroUIProvider} from '@heroui/react'
import ToastProvider from '@/src/components/global/providers/toastProvider'
import Header from '@/src/components/global/header/Header'
import AuthProvider from '@/src/components/global/providers/authProvider'
import {Provider} from 'jotai'

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <AuthProvider>
      <HeroUIProvider
        locale="ru-RU"
        className="gradient relative min-h-[100dvh] w-full min-w-fit">
        <Header />
        <Provider>
          <div style={{paddingTop: 'var(--header-height, 0px)'}}>
            <ToastProvider />
            {children}
          </div>
        </Provider>
      </HeroUIProvider>
    </AuthProvider>
  )
}
