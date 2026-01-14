'use client'
import {HeroUIProvider} from '@heroui/react'
import ToastProvider from '@/src/components/global/providers/toastProvider'
import Header from '@/src/components/global/header/Header'
import {Provider} from 'jotai'
import {ThemeProvider as NextThemesProvider} from 'next-themes'
import {Snowfall} from 'react-snowfall'
import PushNotificationProvider from '@/src/components/global/providers/PushNotificationProvider'

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <HeroUIProvider
      locale="ru-RU"
      className="background relative min-h-dvh w-full min-w-fit">
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <PushNotificationProvider>
          <Snowfall snowflakeCount={80} />
          <div className="pb-20 sm:flex sm:gap-2 sm:pb-0">
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
  )
}
