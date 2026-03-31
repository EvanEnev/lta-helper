'use client'
import {HeroUIProvider} from '@heroui/react'
import ToastProvider from '@/src/components/global/providers/toastProvider'
import Header from '@/src/components/global/header/Header'
import {Provider} from 'jotai'
import {ThemeProvider as NextThemesProvider} from 'next-themes'
import PushNotificationProvider from '@/src/components/global/providers/PushNotificationProvider'
import {I18nProvider} from '@heroui/react-beta'

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <I18nProvider locale="ru-RU">
      <HeroUIProvider locale="ru-RU" className="background relative min-h-dvh">
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <PushNotificationProvider>
            <div className="w-full min-w-fit pb-16 sm:flex sm:gap-2 sm:pb-0">
              <Provider>
                <Header />
                <div className="w-full">
                  <ToastProvider />
                  {children}
                </div>
              </Provider>
            </div>
          </PushNotificationProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </I18nProvider>
  )
}
