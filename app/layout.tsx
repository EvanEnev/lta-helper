import AuthProvider from '@/src/utils/authProvider'
import StateProvider from '@/src/utils/stateProvider'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'Расписание ЛТ-Арена',
  description: 'Сайт для удобной генерации расписаний',
}

export default function RootLayout() {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <StateProvider>
          <AuthProvider />
        </StateProvider>
      </body>
    </html>
  )
}
