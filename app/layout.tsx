import AuthProvider from '@/src/utils/authProvider'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import StateProvider from '@/src/utils/stateProvider'
import {NextUIProvider} from '@nextui-org/react'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'Расписание ЛТ-Арена',
  description: 'Сайт для удобной генерации расписаний',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className + ' gradient'}>
        <StateProvider>
          <NextUIProvider locale="ru-RU">
            <AuthProvider>{children}</AuthProvider>
          </NextUIProvider>
        </StateProvider>
      </body>
    </html>
  )
}
