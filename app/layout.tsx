import '@/app/globals.css'

import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import Script from 'next/script'
import Providers from '@/src/components/global/providers/Providers'

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
      <body
        className={inter.className + ' gradient relative w-fit min-w-screen'}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
