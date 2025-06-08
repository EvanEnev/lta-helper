import '@/app/globals.css'

import type {Metadata, Viewport} from 'next'
import {Inter} from 'next/font/google'
import Script from 'next/script'
import Providers from '@/src/components/global/providers/Providers'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'LTA Helper',
  description: 'Помощник в LTA',
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  userScalable: false,
  maximumScale: 1,
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <meta name="apple-mobile-web-app-title" content="LTA Helper" />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={inter.className + ' gradient relative w-fit min-w-[100dvw]'}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
