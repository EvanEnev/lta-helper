'use client'
import {HeroUIProvider} from '@heroui/react'
import Header from '@/src/components/global/header/Header'
import AuthProvider from '@/src/components/global/providers/authProvider'
import AlertProvider from '@/src/components/global/providers/alertProvider'
import {SessionProvider} from "next-auth/react";
import {Provider} from "jotai";

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <SessionProvider>
      <HeroUIProvider
        locale="ru-RU"
        className="min-h-screen min-w-screen">
        <Header />
        <Provider>
          <AuthProvider>
            <AlertProvider />
            {children}
          </AuthProvider>
        </Provider>
      </HeroUIProvider>
    </SessionProvider>
  )
}
