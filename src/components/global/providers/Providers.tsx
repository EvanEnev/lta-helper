'use client'
import {HeroUIProvider} from '@heroui/react'
import ToastProvider from '@/src/components/global/providers/toastProvider'
import Header from '@/src/components/global/header/Header'
import AuthProvider from '@/src/components/global/providers/authProvider'
import {Provider} from 'jotai'
import {ThemeProvider as NextThemesProvider} from 'next-themes'

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <AuthProvider>
      <HeroUIProvider
        locale="ru-RU"
        className="gradient relative min-h-[100dvh] w-full min-w-fit">
        <NextThemesProvider attribute="class" defaultTheme="light">
          <div className="sm:flex sm:gap-2">
            <Header />
            <Provider>
              <div className="w-full">
                <ToastProvider />
                {children}
              </div>
            </Provider>
          </div>
        </NextThemesProvider>
      </HeroUIProvider>
    </AuthProvider>
  )
}
