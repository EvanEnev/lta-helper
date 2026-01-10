'use client'
import {HeroUIProvider} from '@heroui/react'
import ToastProvider from '@/src/components/global/providers/toastProvider'
import Header from '@/src/components/global/header/Header'
import {Provider} from 'jotai'
import {ThemeProvider as NextThemesProvider} from 'next-themes'
import {Snowfall} from 'react-snowfall'
import PushNotificationManager from '@/src/components/pwa/PushNotificationManager'
import InstallPrompt from '@/src/components/pwa/InstallPromt'

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <HeroUIProvider
      locale="ru-RU"
      className="background relative min-h-dvh w-full min-w-fit">
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <Snowfall snowflakeCount={80} />
        <div className="sm:flex sm:gap-2">
          <Provider>
            <Header />
            <div className="w-full">
              <PushNotificationManager />
              <InstallPrompt />
              <ToastProvider />
              {children}
            </div>
          </Provider>
        </div>
      </NextThemesProvider>
    </HeroUIProvider>
  )
}
